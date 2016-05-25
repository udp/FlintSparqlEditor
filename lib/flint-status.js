
var $ = require('./jquery')

function FlintStatus() {

    var line = 0;
    var position = 0;
    var queryValid = "valid";

    this.setLine = function(cursorLine) {
        line = cursorLine;
    };

    this.setQueryValid = function(valid) {
        if (valid) {
            queryValid = "valid";
        } else {
            queryValid = "invalid";
        }
    };

    this.setPosition = function(cursorPosition) {
        position = cursorPosition;
    };

    this.display = function(container) {
        $('#' + container).append("<div id='flint-status'>...</div>");
    };

    this.updateStatus = function() {
        $('#flint-status').text(
                "Line: " + (line + 1) + "; Position: " + (position + 1)
                        + "; Query is " + queryValid);
    };
}

module.exports = FlintStatus

