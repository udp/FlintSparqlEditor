
var $ = require('./jquery')

function FlintDatasetMimeTypePicker(config, editor) {

    this.setQueryType = function(queryType) {

        try {

            if (queryType === "SELECT") {

                $('#flint-dataset-mimeset-select-chooser').show();
                $('#flint-dataset-mimeset-construct-chooser').hide();

                if ($('#flint-coolbar').is(':visible')) {
                    $('#flint-dataset-mimeset-select').attr('disabled', '');
                    $('#flint-dataset-mimeset-construct').attr('disabled', 'disabled');
                } else {
                    $('#flint-dataset-mimeset-select, #flint-dataset-mimeset-construct')
                            .attr('disabled', 'disabled');
                }
            } else if (queryType === "CONSTRUCT" || queryType === "DESCRIBE") {
                $('#flint-dataset-mimeset-construct-chooser').show();
                $('#flint-dataset-mimeset-select-chooser').hide();

                if ($('#flint-coolbar').is(':visible')) {
                    $('#flint-dataset-mimeset-construct').attr('disabled', '');
                    $('#flint-dataset-mimeset-select').attr('disabled', 'disabled');
                } else {
                    $('#flint-dataset-mimeset-select, #flint-dataset-mimeset-construct')
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
                            "<div id='flint-dataset-output-formats' title='Select the format in which you would like the results to be returned'><h2>Output</h2></div>");

            selectChooser = "<div id='flint-dataset-mimeset-select-chooser' title='Select the output type that you wish to request'><select id='flint-dataset-mimeset-select' name='output'>"
                    + selectChooser + "</select></div>";

            constructChooser = "<div id='flint-dataset-mimeset-construct-chooser' title='Select the output type that you wish to request'><select id='flint-dataset-mimeset-construct' name='output'>"
                    + constructChooser + "</select></div>";

            $('#flint-dataset-output-formats').append(selectChooser);
            $('#flint-dataset-output-formats').append(constructChooser);
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.disable = function() {
        $('#flint-dataset-output-formats').css('visibility', 'hidden');
    };

    this.enable = function() {
        $('#flint-dataset-output-formats').css('visibility', 'visible');
    };

    this.getMimeType = function() {
        try {
            var mimeType = "";
            if ($("#flint-dataset-mimeset-select").is(":visible")) {
                mimeType = $("#flint-dataset-mimeset-select").val();
            } else {
                mimeType = $("#flint-dataset-mimeset-construct").val();
            }
            return mimeType;
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.setChangeAction = function(callback) {
    };
}

module.exports = FlintDatasetMimeTypePicker


