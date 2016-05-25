
var $ = require('./jquery')

function FlintEndpointMimeTypePicker(config, editor) {

    this.setQueryType = function(queryType) {
        try {
            if (queryType === "SELECT") {
                $('#flint-endpoint-mimeset-select-chooser').show();
                $('#flint-endpoint-mimeset-construct-chooser').hide();

                if ($('#flint-endpoint-bar').is(':visible')) {
                    $('#flint-endpoint-mimeset-select').attr('disabled', '');
                    $('#flint-endpoint-mimeset-construct').attr('disabled', 'disabled');
                } else {
                    $(
                            '#flint-endpoint-mimeset-select, #flint-endpoint-mimeset-construct')
                            .attr('disabled', 'disabled');
                }
            } else if (queryType === "CONSTRUCT" || queryType === "DESCRIBE") {
                $('#flint-endpoint-mimeset-construct-chooser').show();
                $('#flint-endpoint-mimeset-select-chooser').hide();

                if ($('#flint-endpoint-bar').is(':visible')) {
                    $('#flint-endpoint-mimeset-construct').attr('disabled', '');
                    $('#flint-endpoint-mimeset-select').attr('disabled', 'disabled');
                } else {
                    $(
                            '#flint-endpoint-mimeset-select, #flint-endpoint-mimeset-construct')
                            .attr('disabled', 'disabled');
                }
            }
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.display = function(container) {
        try {
            var selectChooser = "";
            var constructChooser = "";

            // use output parameter for IE, otherwise accept header mimetype
            var type;
            if ($.browser.msie) {
                type = 'format';
            } else {
                type = 'type';
            }

            var i;
            for (i = 0; i < config.defaultEndpointParameters.selectFormats.length; i++) {
                selectChooser += "<option value='"
                        + config.defaultEndpointParameters.selectFormats[i][type] + "'>"
                        + config.defaultEndpointParameters.selectFormats[i].name
                        + "</option>";
            }

            for (i = 0; i < config.defaultEndpointParameters.constructFormats.length; i++) {
                constructChooser += "<option value='"
                        + config.defaultEndpointParameters.constructFormats[i][type]
                        + "'>"
                        + config.defaultEndpointParameters.constructFormats[i].name
                        + "</option>";
            }

            $('#' + container)
                    .append(
                            "<div id='flint-endpoint-output-formats' title='Select the format in which you would like the results to be returned'><h2>Output</h2></div>");

            selectChooser = "<div id='flint-endpoint-mimeset-select-chooser' title='Select the output type that you wish to request'><select id='flint-endpoint-mimeset-select' name='output'>"
                    + selectChooser + "</select></div>";

            constructChooser = "<div id='flint-endpoint-mimeset-construct-chooser' title='Select the output type that you wish to request'><select id='flint-endpoint-mimeset-construct' name='output'>"
                    + constructChooser + "</select></div>";

            $('#flint-endpoint-output-formats').append(selectChooser);
            $('#flint-endpoint-output-formats').append(constructChooser);
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.disable = function() {
        $('#flint-endpoint-output-formats').css('visibility', 'hidden');
    };

    this.enable = function() {
        $('#flint-endpoint-output-formats').css('visibility', 'visible');
    };

    this.getMimeType = function() {
        try {
            var mimeType = "";
            if ($("#flint-endpoint-mimeset-select").is(":visible")) {
                mimeType = $("#flint-endpoint-mimeset-select").val();
            } else {
                mimeType = $("#flint-endpoint-mimeset-construct").val();
            }
            return mimeType;
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.setChangeAction = function(callback) {
    };
}

module.exports = FlintEndpointMimeTypePicker


