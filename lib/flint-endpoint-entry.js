
var $ = require('./jquery')

// The endpoint entry item allows for a freeform URL of an endpoint
function FlintEndpointEntry(config, editor) {

    try {
        var endpointItems = [];

        this.addItem = function() {
            try {
                var i;
                for (i = 0; i < endpointItems.length; i++) {
                    if (endpointItems[i].uri === this.getEndpoint()) {
                        return;
                    }
                }
                var newItem = {};
                newItem.uri = this.getEndpoint();
                endpointItems.push(newItem);
            } catch (e) {
                editor.getErrorBox().show("EndpointEntryAddItem: " + e);
            }
        };

        this.getItems = function() {
            return endpointItems;
        };

        this.getItem = function(endpoint) {
            var i;
            for (i = 0; i < endpointItems.length; i++) {
                if (endpointItems[i].uri === endpoint) {
                    return endpointItems[i];
                }
            }
            return null;
        };

        this.display = function(container) {
            var endpoint = 'http://gov.tso.co.uk/tso-gazette-index-wwi/sparql';
            $('#' + container)
                    .append(
                            "<div id='flint-endpoint-input' title='Enter the endpoint that you wish to query'><h2>Endpoint</h2><input id='flint-endpoint-url' type='text' value='"
                                    + endpoint + "' name='endpoint'></div>");
            // Ensure we register the endpoint
            this.addItem();
        };

        this.getEndpoint = function() {
            return $("#flint-endpoint-url").val();
        };
    } catch (e) {
        editor.getErrorBox().show("FlintEndpointEntry: " + e);
    }
}

module.exports = FlintEndpointEntry


