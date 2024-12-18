class EmojiPickerService {
    constructor() {
        this.picker = null;
        this.container = null;
        this.init();
    }

    init() {
        // Create container for picker
        this.container = document.createElement('div');
        this.container.style.display = 'none';
        this.container.style.position = 'absolute';
        this.container.style.zIndex = '10000';
        document.body.appendChild(this.container);

        // Create picker
        this.picker = document.createElement('emoji-picker');
        this.container.appendChild(this.picker);

        // Handle emoji selection
        this.picker.addEventListener('emoji-click', event => {
            if (this.currentCallback) {
                this.currentCallback({ emoji: event.detail.unicode });
            }
            this.hide();
        });

        // Handle clicking outside
        document.addEventListener('click', (e) => {
            if (this.container.style.display !== 'none' && 
                !this.container.contains(e.target) && 
                e.target !== this.currentTrigger) {
                this.hide();
            }
        });
    }

    showPicker(triggerElement, callback) {
        this.currentTrigger = triggerElement;
        this.currentCallback = callback;

        const rect = triggerElement.getBoundingClientRect();
        this.container.style.top = `${rect.bottom + 5}px`;
        this.container.style.left = `${rect.left}px`;
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
        this.currentTrigger = null;
        this.currentCallback = null;
    }
}

window.emojiPicker = new EmojiPickerService();