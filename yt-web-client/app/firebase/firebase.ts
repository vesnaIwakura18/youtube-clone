// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBN27igWWbOd-LgKMb2chzvFImC-fIV2sk",
  authDomain: "yt-clone-c3051.firebaseapp.com",
  projectId: "yt-clone-c3051",
  appId: "1:522051628741:web:940ba98157abca9fe54aac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const functions = getFunctions();

export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider())
}

export function signOut() {
    return auth.signOut();
}

export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}