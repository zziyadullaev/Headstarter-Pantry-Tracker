// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore"
import { getStorage } from 'firebase/storage';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIe61lleeDnJGxTOu2uvAqKN5S5m5nf40",
  authDomain: "pantry-tracker-fae66.firebaseapp.com",
  projectId: "pantry-tracker-fae66",
  storageBucket: "pantry-tracker-fae66.appspot.com",
  messagingSenderId: "714129267890",
  appId: "1:714129267890:web:03db08affdf034a4f3bdab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };