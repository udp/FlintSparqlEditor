
var $ = require('./jquery')

// The SPARQL mode picker allows a user to select
function FlintModePicker(config, editor, pickerContext) {

    try {
        var modeItems = [];
        var i;
        // config.modes contains the list of SPARQL modes that should be
        // made available
        for (i = 0; i < config.defaultModes.length; i++) {
            modeItems.push(config.defaultModes[i]);
        }

        this.getModes = function() {
            return modeItems;
        };

        // Expects an array of possible modes and updates the select
        // dropdown
        this.updateModes = function(datasetItem) {
            $("#flint-" + pickerContext + "-mode-select").text("");
            var index;
            for (index = 0; index < modeItems.length; index++) {
                var listItem = "<option id='flint-mode-" + modeItems[index].mode
                        + "' value='" + modeItems[index].mode + "'>"
                        + modeItems[index].name + "</option>";
                if (datasetItem.modes) {
                    var i;
                    for (i = 0; i < datasetItem.modes.length; i++) {
                        if (datasetItem.modes[i] === modeItems[index].mode) {
                            $("#flint-" + pickerContext + "-mode-select").append(listItem);
                        }
                    }
                } else {
                    $("#flint-" + pickerContext + "-mode-select").append(listItem);
                }
            }
            $("#flint-" + pickerContext + "-mode-select option:first").change();
        };

        this.display = function(container) {
            var listItems = "";

            // if only 1 mode, display disabled textbox instead of
            // dropdown
            if (modeItems.length === 1) {
                $('#' + container)
                        .append(
                                "<div id='flint-"
                                        + pickerContext
                                        + "-modes'><h2>Mode</h2><input disabled='disabled' type=text id='flint-"
                                        + pickerContext + "-mode-select' name='mode' value='"
                                        + modeItems[0].name + "' /></div>");
            } else {
                var i;
                for (i = 0; i < modeItems.length; i++) {
                    listItems += "<option id='flint-mode-" + modeItems[i].mode
                            + "' value='" + modeItems[i].mode + "'>" + modeItems[i].name
                            + "</option>";
                }
                $('#' + container)
                        .append(
                                "<div id='flint-"
                                        + pickerContext
                                        + "-modes' title='Select the SPARQL mode'><h2>Mode</h2><select id='flint-"
                                        + pickerContext + "-mode-select' name='mode'>"
                                        + listItems + "</select></div>");
            }
        };

        this.getMode = function() {
            return $("#flint-" + pickerContext + "-mode-select").val();
        };

        this.setChangeAction = function(callback) {
            $('#flint-' + pickerContext + '-mode-select').change(callback);
        };
    } catch (e) {
        editor.getErrorBox().show(e);
    }
}

module.exports = FlintModePicker


