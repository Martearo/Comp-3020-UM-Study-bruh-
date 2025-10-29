// Menu functionality
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenu = document.getElementById('closeMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  function openMenu() {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenuHandler() {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  closeMenu.addEventListener('click', closeMenuHandler);
  menuOverlay.addEventListener('click', closeMenuHandler);
});