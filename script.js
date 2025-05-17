window.addEventListener('DOMContentLoaded', () => {
  // Load navbar from external file
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;

      // Attach menu toggle button event (after navbar is injected)
      const toggleBtn = document.getElementById("menuToggleBtn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          document.getElementById("menuContainer").classList.toggle("show-menu");
        });
      }
    });
});
