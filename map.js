document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('imageContainer');
  let isDragging = false;
  let startX, startY;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  // Set initial cursor style
  container.style.cursor = 'grab';

  // Zoom functionality
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    const scaleChange = delta > 0 ? 0.9 : 1.1;
    scale *= scaleChange;

    // Limit scale
    scale = Math.min(Math.max(0.5, scale), 4);
    updateTransform();
  });

  // Pan functionality
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    container.style.cursor = 'grabbing';
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  });

  container.addEventListener('mousemove', (e) => {
    if (isDragging) {
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mouseleave', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  function updateTransform() {
    container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
});