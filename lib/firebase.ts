import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBR63Ln_DiWwnwisMLOE7aHOBBhlyHkgcA",
  authDomain: "yeildsim-dss.firebaseapp.com",
  projectId: "yeildsim-dss",
  storageBucket: "yeildsim-dss.firebasestorage.app",
  messagingSenderId: "180798801051",
  appId: "1:180798801051:web:29a46cf58d926b8bb3323e",
  measurementId: "G-EM68E0D3BZ"
}

// Initialize Firebase only once (prevents duplicate app errors in Next.js HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
