class BellRingerWidget extends Widget {
    constructor(config) {
        super(config);
        this.type = 'bellringer';
        this.settings = {
            color: '#2ec4b6',
            textSize: 'medium',
            title: 'Bell Ringer',
            content: '<p>Today\'s warm-up activity...</p>',
            ...config.settings
        };
        console.log('BellRingerWidget initialized with settings:', this.settings);
    }

    getIcon() {
        return '<i class="fas fa-bell"></i>';
    }

    render() {
        return `
            <div class="bellringer-content" data-size="${this.settings.textSize}">
                <div class="bellringer-title" style="color: ${this.settings.color}">
                    ${this.settings.title}
                </div>
                <div class="bellringer-display">
                    ${this.settings.content}
                </div>
            </div>
        `;
    }

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
                        <button class="btn btn-sm btn-link edit-bellringer-btn" title="Edit Bell Ringer">
                            <i class="fas fa-edit"></i>
                        </button>
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

    onInitialize($widget) {
        this.setupEventListeners($widget);
    }

    setupEventListeners($widget) {
        super.setupEventListeners($widget);

        $widget.find('.edit-bellringer-btn').on('click', () => {
            this.showBellRingerEditor();
        });
    }

    showBellRingerEditor() {
        Swal.fire({
            title: 'Edit Bell Ringer',
            html: `
                <div class="mb-3">
                    <div class="rich-text-toolbar btn-group">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-command="bold">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-command="italic">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-command="underline">
                            <i class="fas fa-underline"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-command="strikeThrough">
                            <i class="fas fa-strikethrough"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-command="insertUnorderedList">
                            <i class="fas fa-list-ul"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-command="insertOrderedList">
                            <i class="fas fa-list-ol"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary emoji-picker-btn">
                            <i class="fas fa-smile"></i>
                        </button>
                    </div>
                </div>
                <div class="form-control bellringer-editor" 
                     contenteditable="true" 
                     style="min-height: 150px; max-height: 300px; overflow-y: auto;"
                >${this.settings.content}</div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            width: '600px',
            didOpen: () => {
                this.setupRichTextEditor();
                this.setupEmojiPicker();
            },
            preConfirm: () => {
                return {
                    content: document.querySelector('.bellringer-editor').innerHTML
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.settings.content = result.value.content;
                this.updateWidget();
            }
        });
    }

    setupRichTextEditor() {
        $('.rich-text-toolbar button').not('.emoji-picker-btn').on('click', function(e) {
            e.preventDefault();
            const command = $(this).data('command');
            if (command) {
                document.execCommand(command, false, null);
            }
        });

        $('.bellringer-editor').on('focus blur', function() {
            $(this).closest('.form-control').toggleClass('focus');
        });
    }

    setupEmojiPicker() {
        $('.emoji-picker-btn').on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            window.emojiPicker.showPicker(e.currentTarget, selection => {
                const editor = document.querySelector('.bellringer-editor');
                if (editor) {
                    const range = window.getSelection().getRangeAt(0);
                    const node = document.createTextNode(selection.emoji);
                    range.insertNode(node);
                    range.collapse(false);
                    editor.focus();
                }
            });
        });
    }

    openSettings() {
        Swal.fire({
            title: 'Bell Ringer Widget Settings',
            html: `
                <div class="mb-3">
                    <label class="form-label">Widget Title</label>
                    <input type="text" id="widgetTitle" class="form-control" 
                           value="${this.settings.title}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Text Size</label>
                    <select id="textSize" class="form-select">
                        <option value="small" ${this.settings.textSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${this.settings.textSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${this.settings.textSize === 'large' ? 'selected' : ''}>Large</option>
                        <option value="x-large" ${this.settings.textSize === 'x-large' ? 'selected' : ''}>Extra Large</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Color</label>
                    <input type="color" class="form-control form-control-color" 
                           id="bellringerColor" value="${this.settings.color}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            preConfirm: () => {
                return {
                    title: document.getElementById('widgetTitle').value,
                    textSize: document.getElementById('textSize').value,
                    color: document.getElementById('bellringerColor').value,
                    content: this.settings.content
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.settings = result.value;
                this.updateWidget();
            }
        });
    }

    updateWidget() {
        const $widget = $(`#widget-${this.id}`);
        $widget.find('.widget-content').html(this.render());
        this.onInitialize($widget);
        this.save();
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            position: this.position,
            settings: {
                color: this.settings.color,
                textSize: this.settings.textSize,
                title: this.settings.title,
                content: this.settings.content
            }
        };
    }
}

console.log('BellRingerWidget.js loaded'); 