
var $ = require('./jquery')

function FlintEndpointDataInfoButton(editor) {

    this.display = function(container) {
        try {
            $('#' + container)
                    .append(
                            "<input class='flint-info-button' id='flint-endpoint-datainfo' type='button' value='Get Dataset Info' title='Query dataset for properties and classes'/>");
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.setClickAction = function(callback) {
        $('#flint-endpoint-datainfo').click(callback);
    };
}

module.exports = FlintEndpointDataInfoButton

