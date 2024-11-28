import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCF7VJ4sTNCrs19LVRiWRCPjNk9PeXm2WA",
    authDomain: "soundscout-1591b.firebaseapp.com",
    projectId: "soundscout-1591b",
    storageBucket: "soundscout-1591b.appspot.com",
    messagingSenderId: "631492086503",
    appId: "1:631492086503:web:7f9180a99dc115d006b042",
    measurementId: "G-YS3LN6DR7W",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

