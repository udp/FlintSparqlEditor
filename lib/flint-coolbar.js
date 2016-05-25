
var $ = require('./jquery')

var FlintDatasetPicker = require('./flint-dataset-picker')
var FlintModePicker = require('./flint-mode-picker')
var FlintDatasetQuerySubmitButton = require('./flint-dataset-query-submit-button')
var FlintDatasetMimeTypePicker = require('./flint-dataset-mimetype-picker')

function FlintCoolbar(config, editor) {

    var coolbarItems = [];

    try {
        coolbarItems.push(new FlintDatasetPicker(config, editor));
        coolbarItems.push(new FlintModePicker(config, editor, 'coolbar'));
        coolbarItems.push(new FlintDatasetQuerySubmitButton(editor));
        coolbarItems.push(new FlintDatasetMimeTypePicker(config, editor));
        this.getItems = function() {
            return coolbarItems;
        };
    } catch (e) {
        editor.getErrorBox().show(e);
    }

    this.hide = function() {
        $('#flint-coolbar').hide();
    };

    this.show = function() {
        $('#flint-coolbar').show();
    };

    this.display = function(container) {
        var listItems = "";
        var i;
        $('#' + container).append("<div id='flint-coolbar'></div>");
        for (i = 0; i < coolbarItems.length; i++) {
            listItems += coolbarItems[i].display('flint-coolbar');
        }
    };
}

module.exports = FlintCoolbar

