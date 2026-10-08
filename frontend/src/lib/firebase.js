import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCkhbJrDUOtdttt_bwgZjoT8WJoiOoxosc",
  authDomain: "flexigo-74574.firebaseapp.com",
  projectId: "flexigo-74574",
  storageBucket: "flexigo-74574.firebasestorage.app",
  messagingSenderId: "985479144542",
  appId: "1:985479144542:web:f0f77764e72279d68540cf",
  measurementId: "G-YZVP534P17",
  databaseURL: "https://flexigo-74574-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

console.log('✅ Firebase Initialized (Frontend)');

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: "BOoqMGTwH14TdZsp0ryBlwtN_ry09EcOUqN5rY9ZnNEdMNhgGkG22DxVo4xW-M70XkclYqOzclzd_TOSa7r7K3M" 
    });
    if (currentToken) {
      console.log('✅ FCM Token generated:', currentToken);
      return currentToken;
    } else {
      console.log('❌ No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    if (err.code === 'messaging/permission-blocked') {
      console.warn('⚠️ Push notifications are blocked by the user.');
    } else {
      console.error('❌ FCM Token retrieval error:', err);
    }
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground Notification received:', payload);
      resolve(payload);
    });
  });

export default app;
