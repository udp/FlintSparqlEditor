
var FlintEndpointEntry = require('./flint-endpoint-entry')
var FlintModePicker = require('./flint-mode-picker')
var FlintEndpointMimeTypePicker = require('./flint-endpoint-mimetype-picker')
var FlintEndpointDataInfoButton = require('./flint-endpoint-data-info-button')
var FlintEndpointQuerySubmitButton = require('./flint-endpoint-query-submit-button')

var $ = require('./jquery')

function FlintEndpointBar(config, editor) {

    var barItems = [];

    try {
        barItems.push(new FlintEndpointEntry(config, editor));
        barItems.push(new FlintEndpointQuerySubmitButton(editor));
        barItems.push(new FlintEndpointDataInfoButton(editor));
        barItems.push(new FlintEndpointMimeTypePicker(config, editor));
        barItems.push(new FlintModePicker(config, editor, 'endpoint'));
        this.getItems = function() {
            return barItems;
        };
    } catch (e) {
        editor.getErrorBox().show(e);
    }

    this.hide = function() {
        $('#flint-endpoint-bar').hide();
    };

    this.show = function() {
        $('#flint-endpoint-bar').show();
    };

    this.display = function(container) {
        var listItems = "";
        var i;
        $('#' + container).append("<div id='flint-endpoint-bar'></div>");
        for (i = 0; i < barItems.length; i++) {
            listItems += barItems[i].display('flint-endpoint-bar');
        }
    };
}

module.exports = FlintEndpointBar


