// Map functionality
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('imageContainer');
  const image = document.getElementById('panZoomImage');
  let isDragging = false;
  let startX, startY, translateX = 0, translateY = 0;
  let scale = 1.0;
  let minScale = 0.5;
  let maxScale = 3.0;

  function updateTransform() {
    container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Zoom controls
  document.getElementById('zoomIn').addEventListener('click', () => {
    if (scale < maxScale) {
      scale = Math.min(scale * 1.2, maxScale);
      updateTransform();
    }
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    if (scale > minScale) {
      scale = Math.max(scale / 1.2, minScale);
      updateTransform();
    }
  });

  document.getElementById('resetView').addEventListener('click', () => {
    scale = 1.0;
    translateX = 0;
    translateY = 0;
    updateTransform();
  });

  // Pan functionality
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    container.style.cursor = 'grabbing';
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
});