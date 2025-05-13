// Batas waktu akses: 5 menit
setTimeout(() => {
  alert("Waktu habis. Mengalihkan ke halaman utama...");
  window.location.href = "index.html";
}, 5 * 60 * 1000);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtuu09K1IIeFHebBNITSlKt-HDsNhXBxY",
  authDomain: "kaiserliche-data.firebaseapp.com",
  databaseURL: "https://kaiserliche-data-default-rtdb.firebaseio.com",
  projectId: "kaiserliche-data",
  storageBucket: "kaiserliche-data.firebasestorage.app",
  messagingSenderId: "1035155343303",
  appId: "1:1035155343303:web:908a59ebd90bccb605fbe2",
  measurementId: "G-45MB5YEBZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Fungsi login
async function confirmLogin() {
  const inputs = document.querySelectorAll(".input-field");
  const kodeInput = inputs[0].value.trim();
  const passInput = inputs[1].value.trim();

  const loginRef = ref(db, "logins");

  try {
    const snapshot = await get(loginRef);

    if (!snapshot.exists()) {
      alert("Data login tidak ditemukan.");
      return;
    }

    const data = snapshot.val();
    let tipeDitemukan = null;

    // Cari kecocokan
    for (let tipe in data) {
      const { kode, pass, used } = data[tipe];
      if (kode === kodeInput && pass === passInput) {
        if (used === true) {
          alert(`Tipe ${tipe} sudah digunakan.`);
          return;
        } else {
          tipeDitemukan = tipe;
          break;
        }
      }
    }

    if (!tipeDitemukan) {
      alert("Kode atau password salah.");
      return;
    }

    // Tandai sebagai sudah digunakan di Firebase
    await update(ref(db, `logins/${tipeDitemukan}`), { used: true });

    alert(`Login berhasil sebagai tipe ${tipeDitemukan}.`);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    alert("Terjadi kesalahan saat login.");
  }
}