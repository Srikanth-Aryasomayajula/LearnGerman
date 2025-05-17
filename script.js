window.addEventListener('DOMContentLoaded', () => {
  // Load navbar
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;

      const toggleBtn = document.getElementById("menuToggleBtn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          document.getElementById("menuContainer").classList.toggle("show-menu");
        });
      }
    });

  // Load footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });
});
