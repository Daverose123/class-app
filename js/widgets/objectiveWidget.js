class ObjectiveWidget extends Widget {
    constructor(config) {
        super(config);
        this.type = 'objective';
        this.settings = {
            color: '#2ec4b6',
            textSize: 'medium',
            title: 'Lesson Objective',
            objective: '<p>Students will be able to...</p>',
            ...config.settings
        };
        console.log('ObjectiveWidget initialized with settings:', this.settings);
    }

    getIcon() {
        return '<i class="fas fa-bullseye"></i>';
    }

    render() {
        return `
            <div class="objective-content" data-size="${this.settings.textSize}">
                <div class="objective-title" style="color: ${this.settings.color}">
                    ${this.settings.title}
                </div>
                <div class="objective-display">
                    ${this.settings.objective}
                </div>
            </div>
        `;
    }

    onInitialize($widget) {
        this.setupEventListeners($widget);
    }

    setupEventListeners($widget) {
        super.setupEventListeners($widget);

        $widget.find('.edit-objective-btn').on('click', () => {
            this.showObjectiveEditor();
        });
    }

    showObjectiveEditor() {
        Swal.fire({
            title: 'Edit Lesson Objective',
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
                <div class="form-control objective-editor" 
                     contenteditable="true" 
                     style="min-height: 150px; max-height: 300px; overflow-y: auto;"
                >${this.settings.objective}</div>
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
                    objective: document.querySelector('.objective-editor').innerHTML
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.settings.objective = result.value.objective;
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

        $('.objective-editor').on('focus blur', function() {
            $(this).closest('.form-control').toggleClass('focus');
        });
    }

    setupEmojiPicker() {
        $('.emoji-picker-btn').on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            window.emojiPicker.showPicker(e.currentTarget, selection => {
                const editor = document.querySelector('.objective-editor');
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
            title: 'Objective Widget Settings',
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
                           id="objectiveColor" value="${this.settings.color}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            preConfirm: () => {
                return {
                    title: document.getElementById('widgetTitle').value,
                    textSize: document.getElementById('textSize').value,
                    color: document.getElementById('objectiveColor').value,
                    objective: this.settings.objective
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
                objective: this.settings.objective
            }
        };
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
                        <button class="btn btn-sm btn-link edit-objective-btn" title="Edit Objective">
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
}

console.log('ObjectiveWidget.js loaded'); 