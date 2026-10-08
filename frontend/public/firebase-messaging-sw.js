importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyCkhbJrDUOtdttt_bwgZjoT8WJoiOoxosc",
  authDomain: "flexigo-74574.firebaseapp.com",
  projectId: "flexigo-74574",
  storageBucket: "flexigo-74574.firebasestorage.app",
  messagingSenderId: "985479144542",
  appId: "1:985479144542:web:f0f77764e72279d68540cf",
  measurementId: "G-YZVP534P17"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Background Notification received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo3.png",
    badge: "/logo3.png",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
