import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgXkYDUXePRc64aM0hPwR1QBHI83RKLTc",
  authDomain: "earningstotap.firebaseapp.com",
  projectId: "earningstotap",
  storageBucket: "earningstotap.firebasestorage.app",
  messagingSenderId: "463829984556",
  appId: "1:463829984556:web:ffb4afe979a9b00f543889",
  measurementId: "G-4BQV81JC8B"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  client_id: '463829984556-n6tv7beuakavf4shbvdgc3odveuq2fvh.apps.googleusercontent.com'
});
