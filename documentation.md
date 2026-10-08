# iOS VoIP Push Notifications & CallKit Implementation Guide

This document outlines the architecture and implementation details for handling background ringing and token generation using VoIP Push Notifications (PushKit) and CallKit on iOS.

## Overview
Standard APNs (Apple Push Notification service) cannot reliably wake up an app to show a full-screen incoming call UI. To achieve instant, high-priority background wake-ups for incoming calls (ringing), we use **PushKit** along with **CallKit**.

1. **PushKit**: Provides a specialized VoIP token and guarantees that the app will be woken up in the background immediately when a VoIP push is received.
2. **CallKit**: Provides the native iOS incoming call screen UI. **Apple strictly mandates** that any VoIP push received via PushKit *must* be immediately reported to CallKit to display an incoming call.

---

## 1. Prerequisites & Apple Developer Setup

Before implementing the code, the following setup is required on the Apple Developer Portal and in Xcode:

### Apple Developer Portal:
- Create an **App ID** and enable the **Push Notifications** capability.
- Create a **VoIP Services Certificate**. This certificate is distinct from the standard APNs certificate and is required by your backend to send VoIP pushes.
- Download and install the certificate in your Keychain, then export it as a `.p12` file for your backend (or use APNs Auth Keys `.p8` which supports VoIP as well).

### Xcode Project Setup:
- Navigate to your Target -> **Signing & Capabilities**.
- Add **Background Modes** and check:
  - `Voice over IP`
  - `Background fetch`
  - `Remote notifications`
- Add **Push Notifications** capability.

---

## 2. PushKit Implementation (VoIP Token & Payload)

PushKit is responsible for generating the VoIP token and receiving the payload from the backend even when the app is killed or suspended.

### Registering for VoIP Token
We use `PKPushRegistry` to request a token.

```swift
import PushKit

class VoIPPushManager: NSObject, PKPushRegistryDelegate {
    
    static let shared = VoIPPushManager()
    var pushRegistry: PKPushRegistry?
    
    func registerForVoIP() {
        pushRegistry = PKPushRegistry(queue: DispatchQueue.main)
        pushRegistry?.delegate = self
        pushRegistry?.desiredPushTypes = [.voIP]
    }
    
    // MARK: - PKPushRegistryDelegate
    
    // Called when the VoIP token is generated or updated
    func pushRegistry(_ registry: PKPushRegistry, didUpdatePushCredentials credentials: PKPushCredentials, for type: PKPushType) {
        if type == .voIP {
            let tokenData = credentials.token
            let tokenString = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
            print("VoIP Token: \(tokenString)")
            
            // TODO: Send `tokenString` to your backend server
            sendVoIPTokenToBackend(token: tokenString)
        }
    }
}
```

### Receiving the Background VoIP Push
When the backend sends a VoIP push using the above token, this delegate method is triggered. **You must report this to CallKit within this function.**

```swift
    func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
        
        guard let dictionary = payload.dictionaryPayload as? [String: Any],
              let callId = dictionary["call_id"] as? String,
              let callerName = dictionary["caller_name"] as? String else {
            completion()
            return
        }
        
        // IMPORTANT: Must report to CallKit immediately!
        CallManager.shared.reportIncomingCall(uuid: UUID(uuidString: callId) ?? UUID(), callerName: callerName) { error in
            completion()
        }
    }
```

---

## 3. CallKit Implementation (Ringing UI)

CallKit manages the native ringing UI. We use `CXProvider` to show the incoming call screen and `CXCallController` to perform call actions.

### Reporting an Incoming Call
```swift
import CallKit

class CallManager: NSObject, CXProviderDelegate {
    
    static let shared = CallManager()
    var provider: CXProvider?
    
    override init() {
        super.init()
        let configuration = CXProviderConfiguration(localizedName: "Flexigo")
        configuration.supportsVideo = false
        configuration.maximumCallsPerCallGroup = 1
        configuration.supportedHandleTypes = [.phoneNumber, .generic]
        
        // Custom ringtone can be added here
        // configuration.ringtoneSound = "ringtone.caf"
        
        provider = CXProvider(configuration: configuration)
        provider?.setDelegate(self, queue: nil)
    }
    
    func reportIncomingCall(uuid: UUID, callerName: String, completion: @escaping (Error?) -> Void) {
        let update = CXCallUpdate()
        update.remoteHandle = CXHandle(type: .generic, value: callerName)
        update.hasVideo = false
        
        provider?.reportNewIncomingCall(with: uuid, update: update, completion: { error in
            completion(error)
        })
    }
    
    // MARK: - CXProviderDelegate Methods
    
    func providerDidReset(_ provider: CXProvider) {
        // Handle provider reset
    }
    
    // Triggered when user taps "Accept" on the native call UI
    func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        print("Call Accepted")
        // TODO: Configure Audio Session and connect to WebRTC/Socket
        action.fulfill()
    }
    
    // Triggered when user taps "Decline" on the native call UI
    func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        print("Call Declined")
        // TODO: Notify backend that call was rejected
        action.fulfill()
    }
}
```

---

## 4. Backend Requirements for Sending VoIP Push

When sending the notification from your Node.js/Python backend, you must use the APNs endpoint with the **VoIP Certificate** (or p8 Auth Key). 

### Key Headers Required:
- `apns-push-type`: `voip`
- `apns-expiration`: `0` (Forces immediate delivery or drops it; VoIP calls shouldn't be delayed).
- `apns-priority`: `10`

### Example Payload:
```json
{
  "aps": {
    "content-available": 1
  },
  "call_id": "123e4567-e89b-12d3-a456-426614174000",
  "caller_name": "Flexigo Support",
  "type": "incoming_call"
}
```

## 5. Summary Flow
1. App launches -> `PKPushRegistry` requests VoIP token.
2. Delegate receives token -> Sends token to backend database.
3. Backend initiates call -> Sends VoIP push to APNs using VoIP certificate.
4. App receives push in background -> `didReceiveIncomingPushWith` is triggered.
5. App extracts `call_id` and calls `CXProvider.reportNewIncomingCall`.
6. **Native iOS Ringing Screen** appears.
7. User accepts/declines -> `CXProviderDelegate` handles the action -> App communicates status via WebSocket/API.

> **CRITICAL RULE**: If you receive a PushKit payload and fail to report it to CallKit within the same run loop, iOS will terminate your app and eventually block your app from receiving future VoIP pushes. Always invoke `reportNewIncomingCall` immediately.
