import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVkaCfDPpnBa9CH8HuBnvNHwzsQ7aJpL4",
  authDomain: "umbandacuiaba-a9064.firebaseapp.com",
  projectId: "umbandacuiaba-a9064",
  storageBucket: "umbandacuiaba-a9064.firebasestorage.app",
  messagingSenderId: "192982079558",
  appId: "1:192982079558:web:3b041b4aadf746a457d247",
  measurementId: "G-XPMJD0VLZJ"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific settings to ensure connection in web containers
// experimentalForceLongPolling helps avoid WebSocket timeout issues
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db, analytics, auth };