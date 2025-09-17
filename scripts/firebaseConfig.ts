// firebaseConfig.ts
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWEBzCeKjltv29eI6_hISiR2jVtrKLHY8",
  authDomain: "ring-a-meal.firebaseapp.com",
  databaseURL: "https://ring-a-meal.firebaseio.com",
  projectId: "ring-a-meal",
  storageBucket: "ring-a-meal.firebasestorage.app",
  messagingSenderId: "15056437665",
  appId: "1:15056437665:web:deccb2872bd968b1448be0"
};
// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db: Firestore = getFirestore(app);

export { app, db };

