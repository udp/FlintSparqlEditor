
var $ = require('./jquery')

function FlintEndpointQuerySubmitButton(editor) {

    this.disable = function() {
        $('.flint-submit-button').css('visibility', 'hidden');
    };

    this.enable = function() {
        $('.flint-submit-button').css('visibility', 'visible');
    };

    this.display = function(container) {
        try {
            $('#' + container)
                    .append(
                            "<input class='flint-submit-button' id='flint-endpoint-submit' type='submit' value='Submit' title='Submit query to endpoint'/>");
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.setSubmitAction = function(callback) {
        $('#flint-endpoint-submit').click(callback);
    };
}

module.exports = FlintEndpointQuerySubmitButton

