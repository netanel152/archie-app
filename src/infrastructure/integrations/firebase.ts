// src/infrastructure/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// IMPORTANT: Replace this with your project's actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtrY7JcTovnrIceE5dLO6HffJWa9nCTSg",
  authDomain: "archie-app-aa361.firebaseapp.com",
  projectId: "archie-app-aa361",
  storageBucket: "archie-app-aa361.firebasestorage.app",
  messagingSenderId: "282995815102",
  appId: "1:282995815102:web:08a9fdb2098cad17a064ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need in other parts of your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);