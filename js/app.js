class ClassHub {
    constructor() {
        this.spaces = [];
        this.currentSpaceId = null;
        this.settings = {
            schoolName: 'Class Hub',
            className: '',
            schoolLogo: '' // Base64 or URL of the logo
        };
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderSpaces();
        this.updateHeaderInfo();

        // Add this section to select first space on load
        if (this.spaces.length > 0) {
            // If no space is currently selected, or the selected space doesn't exist anymore
            if (!this.currentSpaceId || !this.spaces.find(s => s.id === this.currentSpaceId)) {
                this.switchToSpace(this.spaces[0].id);
            } else {
                // If there is a valid current space, switch to it
                this.switchToSpace(this.currentSpaceId);
            }
        } else {
            // Optional: Show a welcome message or prompt to create first space
            Swal.fire({
                title: 'Welcome to Class Hub!',
                text: 'Get started by creating your first learning space.',
                icon: 'info',
                confirmButtonText: 'Create Space',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.createNewSpace();
                }
            });
        }
    }

    setupEventListeners() {
        $('#addSpaceBtn').on('click', () => this.createNewSpace());
        $('#settingsBtn').on('click', () => this.openSettings());
        $('.sidebar-toggle').on('click', () => {
            $('.sidebar').toggleClass('collapsed');
            localStorage.setItem('sidebarCollapsed', $('.sidebar').hasClass('collapsed'));
        });

        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            $('.sidebar').addClass('collapsed');
        }
    }

    loadFromLocalStorage() {
        console.log('Loading from localStorage...'); // Debug log
        const savedSpaces = localStorage.getItem('classHubSpaces');
        if (savedSpaces) {
            try {
                const parsed = JSON.parse(savedSpaces);
                this.spaces = parsed.map(space => ({
                    id: space.id,
                    name: space.name,
                    emoji: space.emoji || '📚',
                    centralIdea: space.centralIdea,
                    widgets: (space.widgets || []).map(widget => {
                        const WidgetClass = window[widget.type + 'Widget'];
                        if (WidgetClass) {
                            return new WidgetClass({
                                id: widget.id,
                                position: widget.position,
                                settings: widget.settings
                            });
                        }
                        return null;
                    }).filter(w => w !== null)
                }));
                console.log('Loaded spaces:', this.spaces);
            } catch (e) {
                console.error('Error parsing saved spaces:', e);
                this.spaces = [];
            }
        }

        // Load settings
        const savedSettings = localStorage.getItem('classHubSettings');
        if (savedSettings) {
            try {
                this.settings = JSON.parse(savedSettings);
            } catch (e) {
                console.error('Error parsing saved settings:', e);
            }
        }
    }

    saveToLocalStorage() {
        const spacesToSave = this.spaces.map(space => ({
            id: space.id,
            name: space.name,
            emoji: space.emoji,
            centralIdea: space.centralIdea,
            widgets: (space.widgets || []).map(widget => ({
                id: widget.id,
                type: widget.type,
                position: widget.position,
                settings: widget.settings
            }))
        }));
        localStorage.setItem('classHubSpaces', JSON.stringify(spacesToSave));
        localStorage.setItem('classHubSettings', JSON.stringify(this.settings));
    }

    createNewSpace() {
        Swal.fire({
            title: 'New Learning Space',
            html: `
                <div class="mb-3">
                    <label class="form-label">Space Icon</label>
                    <div class="input-group">
                        <input type="text" id="spaceEmoji" class="form-control" value="📚" readonly>
                        <button class="btn btn-outline-secondary emoji-picker-btn" type="button">
                            <i class="fas fa-smile"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Space Name</label>
                    <input type="text" id="spaceName" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Central Idea (Optional)</label>
                    <textarea id="centralIdea" class="form-control" rows="3"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Create',
            didOpen: () => {
                // Setup emoji picker for space creation
                $('.emoji-picker-btn').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.emojiPicker.showPicker(e.currentTarget, emoji => {
                        $('#spaceEmoji').val(emoji.emoji);
                    });
                });
            },
            preConfirm: () => {
                const name = document.getElementById('spaceName').value;
                if (!name) {
                    Swal.showValidationMessage('Please enter a name!');
                    return false;
                }
                return {
                    name: name,
                    emoji: document.getElementById('spaceEmoji').value,
                    centralIdea: document.getElementById('centralIdea').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const newSpace = {
                    id: Date.now(),
                    name: result.value.name,
                    emoji: result.value.emoji,
                    centralIdea: result.value.centralIdea,
                    widgets: []
                };
                this.spaces.push(newSpace);
                this.saveToLocalStorage();
                this.renderSpaces();
                this.switchToSpace(newSpace.id);
            }
        });
    }

    renderSpaces() {
        const $list = $('.learning-spaces-list');
        $list.empty();
        
        this.spaces.forEach((space, index) => {
            const $item = $(`
                <div class="space-item d-flex justify-content-between align-items-center 
                            ${space.id === this.currentSpaceId ? 'active' : ''}" 
                     data-space-id="${space.id}"
                     data-name="${space.name}">
                    <span class="space-name">
                        <span class="space-emoji">${space.emoji || '📚'}</span>
                        <span class="space-text">${space.name}</span>
                    </span>
                    <div class="space-item-controls">
                        <button class="btn btn-sm btn-link move-space-up" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button class="btn btn-sm btn-link move-space-down" ${index === this.spaces.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <button class="btn btn-sm btn-link space-settings-btn">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="btn btn-sm btn-link remove-space-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `);

            // Add click handlers for each space
            $item.find('.space-name').on('click', () => this.switchToSpace(space.id));
            
            // Settings button handler
            $item.find('.space-settings-btn').on('click', (e) => {
                e.stopPropagation();
                this.openSpaceSettings(space.id);
            });
            
            // Remove button handler
            $item.find('.remove-space-btn').on('click', (e) => {
                e.stopPropagation();
                this.removeSpace(space.id);
            });

            $list.append($item);
        });

        // Add click handlers for the move buttons
        $('.move-space-up').on('click', (e) => {
            e.stopPropagation();
            const $item = $(e.target).closest('.space-item');
            const spaceId = parseInt($item.data('space-id'));
            this.moveSpace(spaceId, 'up');
        });

        $('.move-space-down').on('click', (e) => {
            e.stopPropagation();
            const $item = $(e.target).closest('.space-item');
            const spaceId = parseInt($item.data('space-id'));
            this.moveSpace(spaceId, 'down');
        });
    }

    switchToSpace(spaceId) {
        this.currentSpaceId = spaceId;
        const space = this.spaces.find(s => s.id === spaceId);
        if (space) {
            // Update the active class in the sidebar
            $('.space-item').removeClass('active');
            $(`.space-item[data-space-id="${spaceId}"]`).addClass('active');
            
            // Render the space content
            this.renderSpaceContent(space);
        }
    }

    renderSpaceContent(space) {
        console.log('Rendering space content for space:', space.id);
        console.log('Space widgets data:', space.widgets);
        const $content = $('#content');
        $content.empty();
        
        const learningSpace = new LearningSpace(
            space.id, 
            space.name,
            space.centralIdea
        );
        
        if (space.widgets && Array.isArray(space.widgets)) {
            space.widgets.forEach(widgetData => {
                let widget;
                console.log('Creating widget from data:', widgetData);
                switch (widgetData.type) {
                    case 'clock':
                        widget = new ClockWidget(widgetData);
                        break;
                    case 'weather':
                        widget = new WeatherWidget(widgetData);
                        break;
                    case 'materials':
                        widget = new MaterialsWidget(widgetData);
                        break;
                    case 'announcement':
                        widget = new AnnouncementWidget(widgetData);
                        break;
                    case 'homework':
                        widget = new HomeworkWidget({
                            id: widgetData.id,
                            position: widgetData.position,
                            settings: widgetData.settings
                        });
                        break;
                    case 'objective':
                        widget = new ObjectiveWidget({
                            id: widgetData.id,
                            position: widgetData.position,
                            settings: widgetData.settings
                        });
                        break;
                    case 'bellringer':
                        widget = new BellRingerWidget({
                            id: widgetData.id,
                            position: widgetData.position,
                            settings: widgetData.settings
                        });
                        break;
                }
                if (widget) {
                    console.log('Widget created with state:', widget);
                    learningSpace.widgets.push(widget);
                }
            });
        }
        
        learningSpace.init($content);
    }

    openSettings() {
        Swal.fire({
            title: 'App Settings',
            html: `
                <div class="mb-3">
                    <label class="form-label">School Name</label>
                    <input type="text" id="schoolName" class="form-control" 
                           value="${this.settings.schoolName}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Class Name</label>
                    <input type="text" id="className" class="form-control" 
                           value="${this.settings.className}">
                </div>
                <div class="mb-3">
                    <label class="form-label">School Logo</label>
                    <input type="file" id="schoolLogo" class="form-control" 
                           accept="image/*">
                    <div class="form-text">Recommended size: 120x120 pixels</div>
                </div>
                ${this.settings.schoolLogo ? `
                    <div class="mb-3">
                        <button type="button" class="btn btn-danger btn-sm" id="removeLogo">
                            Remove Current Logo
                        </button>
                    </div>
                ` : ''}
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            didOpen: () => {
                // Handle logo removal
                $('#removeLogo').on('click', () => {
                    this.settings.schoolLogo = '';
                    this.updateHeaderInfo();
                    Swal.close();
                    this.openSettings();
                });
            },
            preConfirm: () => {
                return new Promise((resolve) => {
                    const settings = {
                        schoolName: document.getElementById('schoolName').value,
                        className: document.getElementById('className').value,
                        schoolLogo: this.settings.schoolLogo
                    };

                    const logoInput = document.getElementById('schoolLogo');
                    if (logoInput.files && logoInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            settings.schoolLogo = e.target.result;
                            resolve(settings);
                        };
                        reader.readAsDataURL(logoInput.files[0]);
                    } else {
                        resolve(settings);
                    }
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.settings = result.value;
                this.saveToLocalStorage();
                this.updateHeaderInfo();
            }
        });
    }

    removeSpace(spaceId) {
        const space = this.spaces.find(s => s.id === spaceId);
        if (!space) return;

        Swal.fire({
            title: 'Remove Space',
            text: `Are you sure you want to remove "${space.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove the space
                this.spaces = this.spaces.filter(s => s.id !== spaceId);
                
                // Save changes
                this.saveToLocalStorage();
                
                // Update UI
                this.renderSpaces();
                
                // If the removed space was currently displayed, show another space or clear content
                if (this.currentSpaceId === spaceId) {
                    if (this.spaces.length > 0) {
                        this.switchToSpace(this.spaces[0].id);
                    } else {
                        $('#content').empty();
                        this.currentSpaceId = null;
                    }
                }

                // Show success message
                Swal.fire({
                    title: 'Removed!',
                    text: `${space.name} has been removed.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    }

    openSpaceSettings(spaceId) {
        const space = this.spaces.find(s => s.id === spaceId);
        if (!space) return;

        Swal.fire({
            title: 'Space Settings',
            html: `
                <div class="mb-3">
                    <label class="form-label">Space Icon</label>
                    <div class="input-group">
                        <input type="text" id="spaceEmoji" class="form-control" value="${space.emoji || '📚'}" readonly>
                        <button class="btn btn-outline-secondary emoji-picker-btn" type="button">
                            <i class="fas fa-smile"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Space Name</label>
                    <input type="text" id="spaceName" class="form-control" value="${space.name}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Central Idea</label>
                    <textarea id="centralIdea" class="form-control" rows="3">${space.centralIdea || ''}</textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            didOpen: () => {
                // Setup emoji picker for space settings
                $('.emoji-picker-btn').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.emojiPicker.showPicker(e.currentTarget, emoji => {
                        $('#spaceEmoji').val(emoji.emoji);
                    });
                });
            },
            preConfirm: () => {
                return {
                    name: document.getElementById('spaceName').value,
                    emoji: document.getElementById('spaceEmoji').value,
                    centralIdea: document.getElementById('centralIdea').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                space.name = result.value.name;
                space.emoji = result.value.emoji;
                space.centralIdea = result.value.centralIdea;
                this.saveToLocalStorage();
                this.renderSpaces();
                if (this.currentSpaceId === space.id) {
                    this.renderSpaceContent(space);
                }
            }
        });
    }

    updateHeaderInfo() {
        // Update school name in sidebar
        const $sidebarSchoolName = $('#sidebarSchoolName');
        const $sidebarClassName = $('#sidebarClassName');
        const $sidebarSchoolLogo = $('#sidebarSchoolLogo');

        // Update school name
        if ($sidebarSchoolName.length) {
            $sidebarSchoolName.text(this.settings.schoolName || 'Class Hub');
        }

        // Update class name
        if ($sidebarClassName.length) {
            $sidebarClassName.text(this.settings.className || '');
            // Hide/show class name container based on whether there's content
            $sidebarClassName.toggle(Boolean(this.settings.className));
        }

        // Update logo
        if ($sidebarSchoolLogo.length) {
            if (this.settings.schoolLogo) {
                $sidebarSchoolLogo.attr('src', this.settings.schoolLogo).show();
                $('.school-logo').addClass('has-logo').show();
            } else {
                $sidebarSchoolLogo.hide();
                $('.school-logo').removeClass('has-logo').hide();
            }
        }
    }

    saveSpace(space) {
        const spaceIndex = this.spaces.findIndex(s => s.id === space.id);
        if (spaceIndex !== -1) {
            this.spaces[spaceIndex] = space;
            this.saveToLocalStorage();
        }
    }

    saveAndRenderSpace(space) {
        this.saveSpace(space);
        this.renderSpaceContent(space);
    }

    createWidget(type, space) {
        console.log('Creating widget of type:', type); // Debug log
        let widget;
        const defaultPosition = this.getDefaultWidgetPosition(space);
        
        switch (type) {
            case 'clock':
                widget = new ClockWidget({ position: defaultPosition });
                break;
            case 'weather':
                widget = new WeatherWidget({ position: defaultPosition });
                break;
            case 'materials':
                widget = new MaterialsWidget({ position: defaultPosition });
                break;
            case 'announcement':
                widget = new AnnouncementWidget({ position: defaultPosition });
                break;
            case 'homework':
                console.log('Creating HomeworkWidget...'); // Debug log
                widget = new HomeworkWidget({ position: defaultPosition });
                console.log('HomeworkWidget created:', widget); // Debug log
                break;
            case 'objective':  // Add this case
                console.log('Creating ObjectiveWidget...'); // Debug log
                widget = new ObjectiveWidget({ position: defaultPosition });
                console.log('ObjectiveWidget created:', widget); // Debug log
                break;
            case 'bellringer':
                console.log('Creating BellRingerWidget...');
                widget = new BellRingerWidget({ position: defaultPosition });
                console.log('BellRingerWidget created:', widget);
                break;
        }

        if (widget) {
            console.log('Widget created successfully:', widget); // Debug log
            space.widgets.push(widget);
            this.saveAndRenderSpace(space);
        } else {
            console.error('Failed to create widget of type:', type); // Debug log
        }
    }

    getDefaultWidgetPosition(space) {
        const offset = (space.widgets.length * 30) % 150;
        return {
            left: offset,
            top: offset,
            width: 200,
            height: 150
        };
    }

    moveSpace(spaceId, direction) {
        const spaceIndex = this.spaces.findIndex(s => s.id === spaceId);
        if (spaceIndex === -1) return;

        if (direction === 'up' && spaceIndex > 0) {
            // Move space up
            [this.spaces[spaceIndex], this.spaces[spaceIndex - 1]] = 
            [this.spaces[spaceIndex - 1], this.spaces[spaceIndex]];
        } else if (direction === 'down' && spaceIndex < this.spaces.length - 1) {
            // Move space down
            [this.spaces[spaceIndex], this.spaces[spaceIndex + 1]] = 
            [this.spaces[spaceIndex + 1], this.spaces[spaceIndex]];
        }

        this.saveToLocalStorage();
        this.renderSpaces();
        
        // Keep the moved space selected if it was selected
        if (this.currentSpaceId === spaceId) {
            this.switchToSpace(spaceId);
        }
    }
}

// Initialize the application
$(document).ready(() => {
    window.classHub = new ClassHub();
}); 