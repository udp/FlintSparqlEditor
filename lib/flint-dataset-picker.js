
var $ = require('./jquery')

// The dataset picker allows a user to select the endpoint that they wish to
// send queries to
function FlintDatasetPicker(config, editor) {

    try {
        var datasetItems = [];

        // config.endpoints contains the list of endpoints that should be
        // made available and thus their corresponding configuration data
        var i;
        for (i = 0; i < config.endpoints.length; i++) {
            datasetItems.push(config.endpoints[i]);
        }

        this.getItems = function() {
            return datasetItems;
        };

        this.getItem = function(endpoint) {
            var i;
            for (i = 0; i < datasetItems.length; i++) {
                if (datasetItems[i].uri === endpoint) {
                    return datasetItems[i];
                }
            }
        };

        this.display = function(container) {
            var listItems = "";

            // if only 1 dataset, display disabled textbox instead of
            // dropdown
            if (datasetItems.length === 1) {
                $('#' + container)
                        .append(
                                "<div id='flint-dataset'><h2>Dataset</h2><input disabled='disabled' type=text id='flint-dataset-select' name='kb' value='"
                                        + datasetItems[0].uri + "' /></div>");
            } else {
                var i;
                for (i = 0; i < datasetItems.length; i++) {
                    listItems += "<option value='" + datasetItems[i].uri + "'>"
                            + datasetItems[i].name + "</option>";
                }
                $('#' + container)
                        .append(
                                "<div id='flint-dataset' title='Select the endpoint that you wish to query'><h2>Dataset</h2><select id='flint-dataset-select' name='kb'>"
                                        + listItems + "</select></div>");
            }
        };

        this.getEndpoint = function() {
            return $("#flint-dataset-select").val();
        };

        this.setChangeAction = function(callback) {
            $('#flint-dataset-select').change(callback);
        };
    } catch (e) {
        editor.getErrorBox().show(e);
    }
}

module.exports = FlintDatasetPicker

