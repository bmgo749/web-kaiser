// Waktu maksimum akses sebelum otomatis kembali ke index.html (5 menit)
setTimeout(() => {
  alert("Waktu habis. Mengalihkan ke halaman utama...");
  window.location.href = "index.html";
}, 5 * 60 * 1000); // 5 menit = 300.000 ms

// Fungsi untuk validasi dan login
function confirmLogin() {
  const inputs = document.querySelectorAll(".input-field");
  const kode = inputs[0].value.trim();
  const etik = inputs[1].value.trim();

  // Ganti dengan kode admin & password yang kamu tentukan
  const kodeBenar = "KRRT7362Kt@t2";
  const passwordBenar = "649271@109213";

  if (kode === kodeBenar && etik === passwordBenar) {
    alert("Login berhasil!");
    window.location.href = "dashboard.html"; // arahkan ke halaman admin
  } else {
    alert("Kode atau kata sandi salah.");
  }
}
