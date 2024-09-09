import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database'; // Import các hàm cần thiết

const firebaseConfig = {
  apiKey: "AIzaSyChjUjBGPvKt7Y9WEyQhwTf_o9q6Xuc-qc",
  authDomain: "supplychain-5ae5c.firebaseapp.com",
  databaseURL: "https://supplychain-5ae5c-default-rtdb.firebaseio.com",
  projectId: "supplychain-5ae5c",
  storageBucket: "supplychain-5ae5c.appspot.com",
  messagingSenderId: "235207674724",
  appId: "1:235207674724:web:13d390c7d1e7cf0d718871",
  measurementId: "G-2W2PZDN06V"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
const database = getDatabase(app);

export { database, ref, set, onValue };
