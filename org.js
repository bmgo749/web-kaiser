document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector('.carousel-container');

  container.addEventListener('click', (e) => {
    const clicked = e.target.closest('.card');
    if (!clicked || clicked.classList.contains('center-card')) return;

    const cards = Array.from(container.querySelectorAll('.card'));
    const center = container.querySelector('.center-card');
    const centerIndex = cards.indexOf(center);
    const clickedIndex = cards.indexOf(clicked);

    const isLeft = clickedIndex < centerIndex;
    const isRight = clickedIndex > centerIndex;

    // Mengubah animasi dan menambah kelas sesuai dengan pilihan
    if (isRight) {
      clicked.classList.add('swipe-right');
      center.classList.add('swipe-left');
    } else if (isLeft) {
      clicked.classList.add('swipe-left');
      center.classList.add('swipe-right');
    }

    // Setelah animasi selesai, tukar posisi & atribut
    setTimeout(() => {
      // Tukar posisi DOM
      container.insertBefore(clicked, centerIndex < clickedIndex ? center : center.nextSibling);
      container.insertBefore(center, clickedIndex < centerIndex ? clicked : clicked.nextSibling);

      // Reset kelas
      clicked.classList.remove('swipe-left', 'swipe-right');
      clicked.classList.add('center-card');

      center.classList.remove('center-card', 'swipe-left', 'swipe-right');
      center.classList.add('side-card');
    }, 600);  // Durasi animasi sesuai dengan CSS
  });
});

const button = document.getElementById("box-back");
button.addEventListener("click", () => {
window.location.href = 'index.html' // Ganti dengan URL tujuan
});
