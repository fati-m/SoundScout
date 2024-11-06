// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCF7VJ4sTNCrs19LVRiWRCPjNk9PeXm2WA",
  authDomain: "soundscout-1591b.firebaseapp.com",
  projectId: "soundscout-1591b",
  storageBucket: "soundscout-1591b.firebasestorage.app",
  messagingSenderId: "631492086503",
  appId: "1:631492086503:web:7f9180a99dc115d006b042",
  measurementId: "G-YS3LN6DR7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//Adding to the database
// try {
//     const docRef = await addDoc(collection(db, "users"), {
//       username: "Ada",
//       email: "ada2@wisc.edu",
//       password: "abc123",
//       isAuthenticated: false,
//       SpotifyID: "adaBeats"
//     });
//     console.log("User added: ", docRef.username);
//   } catch (e) {
//     console.error("Error adding user: ", e);
//   }

  export {app, db}