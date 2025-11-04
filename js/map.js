// Map functionality
class MapController {
    constructor() {
        this.container = document.getElementById('imageContainer');
        this.image = document.getElementById('panZoomImage');
        this.zoomIn = document.getElementById('zoomIn');
        this.zoomOut = document.getElementById('zoomOut');
        this.resetView = document.getElementById('resetView');
        
        // Initialize state
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.scale = 1.0;
        this.minScale = 0.5;
        this.maxScale = 3.0;
        
        // Validate elements
        if (!this.container || !this.image) {
            console.error('Required map elements are missing');
            return;
        }
        
        this.initializeControls();
    }
    
    updateTransform() {
        this.container.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
    
    initializeControls() {
        // Zoom controls
        this.zoomIn?.addEventListener('click', () => this.zoom(true));
        this.zoomOut?.addEventListener('click', () => this.zoom(false));
        this.resetView?.addEventListener('click', () => this.reset());
        
        // Pan functionality
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        this.container.addEventListener('mousemove', (e) => this.drag(e));
        this.container.addEventListener('mouseup', () => this.stopDrag());
        this.container.addEventListener('mouseleave', () => this.stopDrag());
        
        // Set initial cursor
        this.container.style.cursor = 'grab';
    }
    
    zoom(isZoomIn) {
        if (isZoomIn && this.scale < this.maxScale) {
            this.scale = Math.min(this.scale * 1.2, this.maxScale);
        } else if (!isZoomIn && this.scale > this.minScale) {
            this.scale = Math.max(this.scale / 1.2, this.minScale);
        }
        this.updateTransform();
    }
    
    reset() {
        this.scale = 1.0;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        this.container.style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (!this.isDragging) return;
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.updateTransform();
    }
    
    stopDrag() {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
    }
}

// Initialize map controller
function initializeMap() {
    const mapController = new MapController();
    return mapController;
}