import St from 'gi://St';

import {Extension, gettext as _, ngettext, pgettext} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';

import GLib from 'gi://GLib';

import Gio from 'gi://Gio';

import GObject from 'gi://GObject';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const ExampleIndicator = GObject.registerClass(
class ExampleIndicator extends QuickSettings.SystemIndicator {
    _init(extensionObject) {
        super._init();
    }
});

const ExampleSlider = GObject.registerClass(
class ExampleSlider extends QuickSettings.QuickSlider {
    _init(extensionObject) {
        super._init({
            iconName: 'selection-mode-symbolic',
            iconLabel: _('Icon Accessible Name'),
        });

        // Watch for changes and set an accessible name for the slider
        this._sliderChangedId = this.slider.connect('notify::value',
            this._onSliderChanged.bind(this));
        this.slider.accessible_name = _('Example Slider');

        // Make the icon clickable (e.g. volume mute/unmute)
        this.iconReactive = true;
        this._iconClickedId = this.connect('icon-clicked',
            () => console.debug('Slider icon clicked!'));

        this.launcher = new Gio.SubprocessLauncher({
           flags: Gio.SubprocessFlags.STDIN_PIPE |
           Gio.SubprocessFlags.STDOUT_PIPE |
           Gio.SubprocessFlags.STDERR_PIPE,
        });
    }

    _onSettingsChanged() {
        // Prevent the slider from emitting a change signal while being updated
        this.slider.block_signal_handler(this._sliderChangedId);
        this.slider.value = this._settings.get_uint('slider-value') / 100.0;
        this.slider.unblock_signal_handler(this._sliderChangedId);
    }

    _onSliderChanged() {
        // Assuming our GSettings holds values between 0..100, adjust for the
        // slider taking values between 0..1
        const power = Math.round(this.slider.value * 40000);
        const proc1 = this.launcher.spawnv(['pkexec', 'ryzenadj', '--stapm-limit', power.toString()]);     
        console.log("EU TO AQUI:" + proc1);
    }
});

export default class ExampleExtension extends Extension {
    enable() {
        this._indicator = new ExampleIndicator(this);
        this._indicator.quickSettingsItems.push(new ExampleSlider(this));

        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator, 2);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
    }
}
