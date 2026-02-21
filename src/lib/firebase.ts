// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCA86ct1Rii6yd_w_d0FUpGRG_u4ShCWOw",
    authDomain: "eco-harvest-e87d8.firebaseapp.com",
    projectId: "eco-harvest-e87d8",
    storageBucket: "eco-harvest-e87d8.firebasestorage.app",
    messagingSenderId: "199070027886",
    appId: "1:199070027886:web:2e628373ed4071dad7567f",
    measurementId: "G-62RNK7K35S"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);