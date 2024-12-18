class Widget {
    constructor(config) {
        this.id = config.id || Date.now();
        this.type = 'base';  // Override in child classes
        this.position = config.position || { left: 0, top: 0, width: 200, height: 150 };
        this.settings = config.settings || {};
    }

    // Add toJSON method
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            position: this.position,
            settings: this.settings
        };
    }

    // Must be implemented by child classes
    render() {
        throw new Error('render() must be implemented');
    }

    // Standard widget wrapper with controls
    renderWidget() {
        const style = `left: ${this.position.left}px; 
                      top: ${this.position.top}px; 
                      width: ${this.position.width}px; 
                      height: ${this.position.height}px;`;

        return `
            <div id="widget-${this.id}" class="widget ${this.type}-widget" style="${style}">
                <div class="widget-header d-flex justify-content-between align-items-center">
                    <span>${this.getIcon()}</span>
                    <div class="widget-controls">
                        <button class="btn btn-sm btn-link widget-settings">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="btn btn-sm btn-link widget-remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content">
                    ${this.render()}
                </div>
            </div>
        `;
    }

    // Initialize widget after rendering
    initialize($widget) {
        this.setupEventListeners($widget);
        this.onInitialize($widget);  // Hook for child classes
    }

    // Standard event listeners
    setupEventListeners($widget) {
        $widget.find('.widget-settings').on('click', () => this.openSettings());
        $widget.find('.widget-remove').on('click', () => this.remove());
    }

    // Save widget state
    save() {
        console.log('Saving widget state:', this);
        const space = this.getCurrentSpace();
        if (space) {
            window.classHub.saveSpace(space);
        }
    }

    // Update widget position
    updatePosition(position) {
        this.position = position;
        this.save();
    }

    // Remove widget
    remove() {
        Swal.fire({
            title: 'Remove Widget',
            text: 'Are you sure you want to remove this widget?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it'
        }).then((result) => {
            if (result.isConfirmed) {
                const space = this.getCurrentSpace();
                if (space) {
                    space.widgets = space.widgets.filter(w => w.id !== this.id);
                    window.classHub.saveAndRenderSpace(space);
                }
                this.onDestroy();  // Cleanup hook for child classes
            }
        });
    }

    // Get current space
    getCurrentSpace() {
        const $widget = $(`#widget-${this.id}`);
        const $space = $widget.closest('.learning-space');
        const spaceId = parseInt($space.data('space-id'));
        return window.classHub.spaces.find(s => s.id === spaceId);
    }

    // Methods that can be overridden by child classes
    getIcon() {
        return '<i class="fas fa-puzzle-piece"></i>';
    }

    openSettings() {
        // Override in child class
    }

    onInitialize($widget) {
        // Override in child class if needed
    }

    onDestroy() {
        // Override in child class if needed
    }
} 