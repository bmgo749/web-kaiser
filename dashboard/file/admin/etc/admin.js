// Batas waktu akses: 5 menit
setTimeout(() => {
  alert("Waktu habis. Mengalihkan ke halaman utama...");
  window.location.href = "index.html";
}, 5 * 60 * 1000);

// Data Tipe Login
const loginData = {
  A: { kode: "KRRT7362Kt@t2", pass: "649271@109213" },
  B: { kode: "POLE8932Bc@r3", pass: "852914@298321" },
  C: { kode: "XZZL9921Cc@q4", pass: "194021@181331" },
  D: { kode: "TRAA1293Dd@f5", pass: "328194@194222" }
};

// Cek tipe berdasarkan input
function getTipeFromInput(kode, pass) {
  for (let tipe in loginData) {
    if (loginData[tipe].kode === kode && loginData[tipe].pass === pass) {
      return tipe;
    }
  }
  return null;
}

// Fungsi login
function confirmLogin() {
  const inputs = document.querySelectorAll(".input-field");
  const kode = inputs[0].value.trim();
  const pass = inputs[1].value.trim();

  const tipe = getTipeFromInput(kode, pass);

  if (!tipe) {
    alert("Kode atau password salah.");
    return;
  }

  // Cek apakah tipe sudah dipakai
  const usedTypes = JSON.parse(localStorage.getItem("usedTypes")) || [];

  if (usedTypes.includes(tipe)) {
    alert(`Tipe ${tipe} sudah digunakan. Silakan gunakan tipe lain.`);
    return;
  }

  // Tandai tipe sebagai sudah digunakan
  usedTypes.push(tipe);
  localStorage.setItem("usedTypes", JSON.stringify(usedTypes));

  alert(`Login berhasil sebagai tipe ${tipe}.`);
  window.location.href = "dashboard.html";
}
