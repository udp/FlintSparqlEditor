
var $ = require('./jquery')

function FlintResults(editor) {

    var results = "";
    var resultsMode = "Visual";

    this.setResults = function(text) {
        results = text;
        if ($.isXMLDoc(results)) {
            if (!window.XMLSerializer) {
                results = results.xml;
            } else {
                var serializer = new window.XMLSerializer();
                results = serializer.serializeToString(results);
            }
        }
        // It's SPARQL XML and we're in dev mode
        if (resultsMode === "Visual"
                && results.indexOf("http://www.w3.org/2005/sparql-results#") > 0) {
            var devHead = "";
            var devResults = "";
            $(results).find("variable").each(function() {
                devHead += "<th>" + $(this).attr("name") + "</th>";
            });
            $(results).find("result").each(
                    function() {
                        devResults += "<tr>";
                        var resultItem = $(this);
                        $(results).find("variable").each(
                                function() {
                                    resultItem.find(
                                            "binding[name='" + $(this).attr("name") + "']").each(
                                            function() {
                                                $(this).find("*").each(
                                                        function() {
                                                            if (this.tagName === "URI") {
                                                                devResults += "<td><a href='"
                                                                        + $(this).text() + "'>" + $(this).text()
                                                                        + "</a></td>";
                                                            } else {
                                                                devResults += "<td>" + $(this).text()
                                                                        + "</td>";
                                                            }
                                                        });
                                            });
                                });
                        devResults += "</tr>";
                    });
            results = "<table id='flint-results-table'><thead><tr>" + devHead
                    + "</tr></thead><tbody>" + devResults + "</tbody></table>";
        } else {
            results = "<textarea id='flint-results'>" + results + "</textarea>";
        }
        this.showLoading(false);
        try {
            $('#flint-results-container').html(results);
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.getResults = function() {
        return results;
    };

    this.showLoading = function(showLoader) {
        if (showLoader) {
            $('#flint-results-loader').show();
            $('#flint-results').hide();
        } else {
            $('#flint-results-loader').hide();
            $('#flint-results').show();
        }
    };

    // Indicates whether results should be basic as returned by server of
    // enhanced
    this.getResultsMode = function() {
        return resultsMode;
    };

    this.display = function(container) {
        $('#' + container)
                .append(
                        "<h2 id='flint-results-heading'>Query Results<span id='flint-results-mode' title='Toggle between visually enhanced results or basic text format'>Visual Results Mode</span></h2>");
        $('#' + container)
                .append(
                        "<div id='flint-results-area';><p id='flint-results-loader'><img src='"
                                + editor.getImagesPath()
                                + "/ajax-loader-red.gif'/> Running query ... please wait</p>"
                                + "<div id='flint-results-container'><textarea id='flint-results'></textarea></div></div>");
        $('#flint-results-mode').click(function() {
            if ($(this).text() === "Visual Results Mode") {
                $(this).text("Basic Results Mode");
                resultsMode = "Basic";
            } else {
                $(this).text("Visual Results Mode");
                resultsMode = "Visual";
            }
        });
    };
}

module.exports = FlintResults

