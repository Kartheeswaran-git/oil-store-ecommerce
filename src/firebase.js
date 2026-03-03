import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNKfu2T7vY_haUJnlkI3clGvMw29RV0lQ",
  authDomain: "oil-store-9dc81.firebaseapp.com",
  projectId: "oil-store-9dc81",
  storageBucket: "oil-store-9dc81.firebasestorage.app",
  messagingSenderId: "103947656993",
  appId: "1:103947656993:web:4ceb6b50c7585578a8e860"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;