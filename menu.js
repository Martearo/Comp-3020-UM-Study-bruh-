document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('menuButton');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenu = document.getElementById('closeMenu');

  menuButton.addEventListener('click', () => {
    sideMenu.classList.add('open');
  });

  closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!sideMenu.contains(event.target) && !menuButton.contains(event.target)) {
      sideMenu.classList.remove('open');
    }
  });
});