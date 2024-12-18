class ClockWidget extends Widget {
    constructor(config) {
        super(config);
        this.type = 'clock';
        this.settings = {
            timeFormat: '24h',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            showSeconds: true,
            color: '#2ec4b6',
            textSize: 'medium',
            ...config.settings
        };
        this.interval = null;
    }

    getIcon() {
        return '<i class="fas fa-clock"></i>';
    }

    render() {
        return `<div class="time" data-size="${this.settings.textSize}" 
                    style="color: ${this.settings.color}">${this.getFormattedTime()}</div>`;
    }

    onInitialize($widget) {
        this.setupClock();
    }

    onDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    setupClock() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            const $widget = $(`#widget-${this.id}`);
            if ($widget.length) {
                $widget.find('.time').text(this.getFormattedTime());
            } else {
                clearInterval(this.interval);
            }
        }, 1000);
    }

    getFormattedTime() {
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            second: this.settings.showSeconds ? 'numeric' : undefined,
            hour12: this.settings.timeFormat === '12h',
            timeZone: this.settings.timezone
        };

        return new Intl.DateTimeFormat('en-US', options).format(new Date());
    }

    openSettings() {
        console.log('Opening clock settings...');
        // Get list of available timezones
        const timezones = Intl.supportedValuesOf('timeZone');
        
        Swal.fire({
            title: 'Clock Settings',
            html: `
                <div class="mb-3">
                    <label class="form-label">Time Format</label>
                    <select id="timeFormat" class="form-select">
                        <option value="12h" ${this.settings.timeFormat === '12h' ? 'selected' : ''}>12-hour</option>
                        <option value="24h" ${this.settings.timeFormat === '24h' ? 'selected' : ''}>24-hour</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Timezone</label>
                    <select id="timezone" class="form-select">
                        ${timezones.map(tz => `
                            <option value="${tz}" ${this.settings.timezone === tz ? 'selected' : ''}>
                                ${tz.replace(/_/g, ' ')}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="showSeconds" 
                               ${this.settings.showSeconds ? 'checked' : ''}>
                        <label class="form-check-label" for="showSeconds">Show Seconds</label>
                    </div>
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
                           id="clockColor" value="${this.settings.color}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            preConfirm: () => {
                return {
                    timeFormat: document.getElementById('timeFormat').value,
                    timezone: document.getElementById('timezone').value,
                    showSeconds: document.getElementById('showSeconds').checked,
                    textSize: document.getElementById('textSize').value,
                    color: document.getElementById('clockColor').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.settings = result.value;
                const $widget = $(`#widget-${this.id}`);
                $widget.find('.widget-content').html(this.render());
                this.onInitialize($widget);
                this.save();
            }
        });
    }
} 