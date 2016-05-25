
var $ = require('./jquery')

function FlintSidebar(editor, config) {

    var activeDataItem;
    var activeTab = "SPARQL";
    var allKeywords = [];
    var visible = false; // Is sidebar visible?

    allKeywords = allKeywords.concat(editor.sparql1Keywords);

    function displaySparql() {
        $('#flint-sidebar-content').text("");
        var rowsize = 4;
        var commandFilterList = "<li>ALL</li>";
        var commandList = "<ul id='flint-command-table'>";
        var i;
        var j;
        for (i = 0; i < allKeywords.length; i += rowsize) {
            for (j = 0; (j < rowsize) && (i + j < allKeywords.length); ++j) {
                commandList += '<li><button type="button" disabled="true" id="flint-keyword-'
                        + allKeywords[i + j][0]
                        + '-button" title="'
                        + allKeywords[i + j][1]
                        + ' functions group" class="flint-keyword-button flint-keyword-group-'
                        + allKeywords[i + j][1]
                        + '">'
                        + allKeywords[i + j][0]
                        + '</button></li>';
                if (commandFilterList.indexOf(allKeywords[i + j][1]) === -1) {
                    commandFilterList += "<li title='Filter view by "
                            + allKeywords[i + j][1] + " keywords'>" + allKeywords[i + j][1]
                            + "</li>";
                }
            }
        }
        commandList += "</ul>";

        commandFilterList = "<ul id='flint-sidebar-command-filter'>"
                + commandFilterList + "</ul>";

        $('#flint-sidebar-content').append(
                commandFilterList + "<div id='flint-sidebar-commands'>" + commandList
                        + "</div>");

        $('#flint-sidebar-command-filter li').click(
                function() {
                    var commandGroupStyle = "flint-keyword-group-" + $(this).text();
                    if ($(this).text() === "ALL") {
                        $('#flint-command-table button').show();
                    } else {
                        $('#flint-command-table button:not(.' + commandGroupStyle + ')')
                                .hide();
                        $('#flint-command-table .' + commandGroupStyle).show();
                    }
                });

    }

    function calcPrefixes() {
        try {
            if (activeDataItem === null) {
                return;
            }
            if (config.namespaces !== null) {
                var listText = "";
                var prefixes = [];
                var j;
                for (j = 0; j < config.namespaces.length; j++) {
                    var found = false;
                    var uri;
                    var prefix;
                    var i;
                    if (activeDataItem.properties != null) {
                        uri = config.namespaces[j].uri;
                        prefix = config.namespaces[j].prefix;
                        for (i = 0; i < activeDataItem.properties.results.bindings.length; i++) {
                            if (activeDataItem.properties.results.bindings[i].p.value
                                    .indexOf(uri) === 0) {
                                prefixes.push(config.namespaces[j]);
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found && activeDataItem.classes != null) {
                        uri = config.namespaces[j].uri;
                        prefix = config.namespaces[j].prefix;
                        for (i = 0; i < activeDataItem.classes.results.bindings.length; i++) {
                            if (activeDataItem.classes.results.bindings[i].o.value
                                    .indexOf(uri) === 0) {
                                prefixes.push(config.namespaces[j]);
                                break;
                            }
                        }
                    }
                }
                activeDataItem.prefixes = prefixes;
            }
        } catch (e) {
            editor.getErrorBox().show("Prefix calculation: " + e);
        }
    }

    this.getPrefixes = function() {

        if (activeDataItem == null) {
            return "";
        }

        var prefixText = "";
        if (activeDataItem.prefixes != null) {
            var i;
            for (i = 0; i < activeDataItem.prefixes.length; i++) {
                prefixText += "PREFIX " + activeDataItem.prefixes[i].prefix + ": <"
                        + activeDataItem.prefixes[i].uri + ">\n";
            }
        }
        return prefixText;
    };

    this.getPrefixCount = function() {

        if (activeDataItem == null) {
            return 0;
        }

        var count = 0;
        if (activeDataItem.prefixes != null) {
            count = activeDataItem.prefixes.length;
        }

        return count;
    };

    this.getActiveDataItem = function() {
        return activeDataItem;
    };

    this.clearActiveItem = function() {
        activeDataItem = null;
    };

    function displayPrefixes() {
        $('#flint-sidebar-content').text("");
        if (activeDataItem) {
            if (activeDataItem.prefixes != null) {
                try {
                    var listText = "";
                    var i;
                    for (i = 0; i < activeDataItem.prefixes.length; i++) {
                        listText += "<li class='flint-prefix' title='"
                                + activeDataItem.prefixes[i].name + "'>"
                                + activeDataItem.prefixes[i].prefix + "</li>";
                    }
                    listText = "<ul>" + listText + "</ul>";
                    $('#flint-sidebar-content').append(listText);
                    $('.flint-prefix').click(function(e) {
                        editor.insert($(this).text());
                        e.stopPropagation();
                    });
                } catch (e) {
                    editor.getErrorBox().show(e);
                }
            } else {
                $('#flint-sidebar-content').append("<p>No prefixes available</p>");
            }
        } else {
            $('#flint-sidebar-content').append(
                    "<p>No prefixes have been retrieved</p>");
        }
    }

    function displaySamples() {
        $('#flint-sidebar-content').text("");
        if (activeDataItem) {
            if (activeDataItem.queries != null) {
                try {
                    var sampleText = "";
                    var i;
                    for (i = 0; i < activeDataItem.queries.length; i++) {
                        var query = activeDataItem.queries[i].query;
                        query = query.replace(/</g, "&lt;");
                        query = query.replace(/>/g, "&gt;");
                        sampleText += "<div class='flint-sample' title=''Click to insert sample into editing pane'><h3>"
                                + activeDataItem.queries[i].name
                                + "</h3><p>"
                                + activeDataItem.queries[i].description
                                + "</p><pre class='flint-sample-content'>"
                                + query
                                + "</pre></div>";
                    }
                    sampleText = "<div id='flint-samples'>" + sampleText + "</div>";
                    $('#flint-sidebar-content').append(sampleText);
                    $('.flint-sample-content')
                            .click(
                                    function(e) {
                                        var okay = true;
                                        var sample = $(this);
                                        if (editor.getCodeEditor().getValue() != "") {
                                            editor.getConfirmDialog().setCloseAction(function() {
                                                var result = editor.getConfirmDialog().getResult();
                                                if (result === "Okay") {
                                                    var cm = editor.getCodeEditor();
                                                    cm.setValue("");
                                                    editor.insert(sample.text());
                                                    // Format
                                                    // query
                                                    var maxlines = cm.lineCount();
                                                    var ln;
                                                    for (ln = 0; ln < maxlines; ++ln) {
                                                        cm.indentLine(ln);
                                                    }
                                                }
                                            });
                                            editor
                                                    .getConfirmDialog()
                                                    .show("Insert Sample Query",
                                                            "<p>Are you sure you want to abandon the current text?</p>");
                                        }
                                        e.stopPropagation();
                                    });
                } catch (e) {
                    editor.getErrorBox().show(e);
                }
            } else {
                $('#flint-sidebar-content').append("<p>No samples available</p>");
            }
        } else {
            $('#flint-sidebar-content').append("<p>Samples are not applicable</p>");
        }
    }

    function displayProperties() {
        $('#flint-sidebar-content').text("");
        if (activeDataItem) {
            if (activeDataItem.properties != null) {
                try {
                    var listText = "";
                    var i;
                    for (i = 0; i < activeDataItem.properties.results.bindings.length; i++) {
                        listText += "<li class='flint-property'>"
                                + activeDataItem.properties.results.bindings[i].p.value
                                + "</li>";
                    }
                    listText = "<ul>" + listText + "</ul>";
                    $('#flint-sidebar-content').append(listText);
                    $('.flint-property').click(function(e) {
                        editor.insert("<" + $(this).text() + ">");
                        e.stopPropagation();
                    });
                } catch (e) {
                    editor.getErrorBox().show(e);
                }
            } else {
                $('#flint-sidebar-content').append("<p>No properties available</p>");
            }
        } else {
            $('#flint-sidebar-content').append(
                    "<p>No properties have been retrieved</p>");
        }
    }

    function displayClasses() {
        $('#flint-sidebar-content').text("");
        if (activeDataItem) {
            if (activeDataItem.classes != null) {
                try {
                    var listText = "";
                    var i;
                    for (i = 0; i < activeDataItem.classes.results.bindings.length; i++) {
                        listText += "<li class='flint-class'>"
                                + activeDataItem.classes.results.bindings[i].o.value
                                + "</li>";
                    }
                    listText = "<ul>" + listText + "</ul>";
                    $('#flint-sidebar-content').append(listText);
                    $('.flint-class').click(function(e) {
                        editor.insert("<" + $(this).text() + ">");
                        e.stopPropagation();
                    });
                } catch (e) {
                    editor.getErrorBox().show(e);
                }
            } else {
                $('#flint-sidebar-content').append("<p>No classes available</p>");
            }
        } else {
            $('#flint-sidebar-content').append(
                    "<p>No classes have been retrieved</p>");
        }
    }

    function showTab(tabName, id) {
        activeTab = tabName;
        $('#flint-sidebar-options li').removeAttr("class");
        $('#' + id).attr("class", "flint-sidebar-selected");
        if (tabName == "Properties") {
            displayProperties();
        } else if (tabName === "Classes") {
            displayClasses();
        } else if (tabName === "Prefixes") {
            displayPrefixes();
        } else if (tabName === "Samples") {
            displaySamples();
        } else {
            $('#flint-sidebar-sparql').attr("class", "flint-sidebar-selected");
            displaySparql();
        }
    }

    this.showActiveTab = function() {
        showTab(activeTab);
    };

    // Is the sidebar visible?
    this.visible = function() {
        return visible;
    };

    this.display = function(container) {
        var listItems = "";
        $('#' + container)
                .append(
                        "<div id='flint-sidebar'>"
                                + "<ul id='flint-sidebar-options'>"
                                + "<li id='flint-sidebar-sparql' title='View a list of SPARQL commands that can be inserted into the query'>SPARQL</li>"
                                + "<li id='flint-sidebar-properties' title='View a list of properties for the current dataset'>Properties</li>"
                                + "<li id='flint-sidebar-classes' title='View a list of classes for the current dataset'>Classes</li>"
                                + "<li id='flint-sidebar-prefixes' title='View a list of known prefixes for the current dataset'>Prefixes</li>"
                                + "<li id='flint-sidebar-samples' title='View sample queries for the current dataset'>Samples</li>"
                                + "</ul><div id='flint-sidebar-content'></div></div>"
                                + "<div id='flint-sidebar-grabber'><span id='flint-sidebar-grabber-button' title='Click to expand/shrink the tools pane'></span></div>");
        $('#flint-sidebar-grabber').click(function() {
            try {
                var editorWidth = $('#flint-editor').width();
                if (visible) {
                    $('#flint-sidebar').css("width", "30px");
                    $('#flint-sidebar-content').css("overflow", "hidden");
                    $('#flint-samples').css("white-space", "nowrap");
                    if (config.interface.toolbar) {
                        if (editor.getToolbar) {
                            editor.getToolbar().setEnabled("Show Tools", true);
                            editor.getToolbar().setEnabled("Hide Tools", false);
                        }
                        if (editor.getMenu) {
                            editor.getMenu().setEnabled("Show Tools", true);
                            editor.getMenu().setEnabled("Hide Tools", false);
                        }
                    }
                    visible = false;
                } else {
                    $('#flint-sidebar').css("width", editorWidth / 2 + "px");
                    $('#flint-sidebar-content').css("overflow", "auto");
                    $('#flint-samples').css("white-space", "wrap");
                    if (config.interface.toolbar) {
                        if (editor.getToolbar) {
                            editor.getToolbar().setEnabled("Show Tools", false);
                            editor.getToolbar().setEnabled("Hide Tools", true);
                        }
                        if (editor.getMenu) {
                            editor.getMenu().setEnabled("Show Tools", false);
                            editor.getMenu().setEnabled("Hide Tools", true);
                        }
                    }
                    visible = true;
                }
                // Force other UI components to resize
                $(window).resize();
            } catch (e) {
                editor.getErrorBox().show(e);
            }
        });
        $('#flint-sidebar-sparql').click(function(e) {
            showTab("SPARQL", $(this).attr("id"));
            e.stopPropagation();
        });
        $('#flint-sidebar-properties').click(function(e) {
            showTab("Properties", $(this).attr("id"));
            e.stopPropagation();
        });
        $('#flint-sidebar-classes').click(function(e) {
            showTab("Classes", $(this).attr("id"));
            e.stopPropagation();
        });
        $('#flint-sidebar-prefixes').click(function(e) {
            showTab("Prefixes", $(this).attr("id"));
            e.stopPropagation();
        });
        $('#flint-sidebar-samples').click(function(e) {
            showTab("Samples", $(this).attr("id"));
            e.stopPropagation();
        });
    };

    // Expects an array of keywords that are valid and a callback function
    // for when the keyword is clicked
    this.updateKeywords = function(possibles, buttonCallback) {

        var keywordLength = allKeywords.length;
        var mode = editor.getCodeEditor().getOption("mode");
        allKeywords = [];
        if (mode === "sparql11query") {
            allKeywords = editor.sparql11Query;
        } else if (mode === "sparql11update") {
            allKeywords = editor.sparql11Update;
        } else {
            allKeywords = editor.sparql1Keywords;
        }
        // If keywords have changed redisplay;
        if (keywordLength !== allKeywords.length) {
            displaySparql();
        }

        var i;
        var j;
        for (i = 0; i < allKeywords.length; ++i) {
            var enabled = false;
            var keyword = allKeywords[i][0];
            for (j = 0; j < possibles.length && !enabled; ++j) {
                if (keyword == possibles[j]) {
                    enabled = true;
                    break;
                }
            }
            var button = $('#flint-keyword-' + keyword + '-button');
            if (enabled) {
                button.attr("disabled", false);
                button.unbind("click");
                button.click(buttonCallback(keyword));
            } else {
                button.attr("disabled", true);
            }
        }
    };

    this.updateSamples = function(datasetItem) {
        activeDataItem = datasetItem;
        if (activeTab === "Samples") {
            displaySamples();
        }
    };

    this.updateProperties = function(datasetItem) {
        try {
            // Don't get properties for update endpoints
            if (datasetItem.modes) {
                var i;
                for (i = 0; i < datasetItem.modes.length; i++) {
                    if (datasetItem.modes[i] === "sparql11update")
                        return;
                }
            }

            if (datasetItem.properties == null) {
                activeDataItem = datasetItem;
                this.showActiveTab();
                var paramsData = {};
                paramsData[config.defaultEndpointParameters.queryParameters.query] = "SELECT DISTINCT ?p WHERE {?s ?p ?o} ORDER BY ?p LIMIT 1000";
                $
                        .ajax({
                            url : datasetItem.uri,
                            data : paramsData,
                            type : 'post',
                            headers : {
                                "Accept" : "application/sparql-results+json"
                            },
                            dataType : 'json',
                            error : function(XMLHttpRequest, textStatus, errorThrown) {
                                editor.getErrorBox().show(
                                        "Properties cannot be retrieved. HTTP Status: "
                                                + XMLHttpRequest.status + ", " + errorThrown);
                            },
                            success : function(data) {
                                datasetItem.properties = data;
                                if (activeTab === "Properties") {
                                    displayProperties();
                                }
                                calcPrefixes();
                                if (activeTab === "Prefixes") {
                                    displayPrefixes();
                                }
                                if (config.maxProperties !== undefined && datasetItem.properties.results.bindings.length == config.maxProperties) {
                                    window
                                            .alert("The maximum number of properties has been reached - " + config.maxProperties);
                                }

                            }
                        });
            } else {
                activeDataItem = datasetItem;
                if (activeTab === "Properties") {
                    displayProperties();
                }
                calcPrefixes();
                if (activeTab === "Prefixes") {
                    displayPrefixes();
                }
            }
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };

    this.updateClasses = function(datasetItem) {
        try {
            // Don't get properties for update endpoints
            if (datasetItem.modes) {
                var i;
                for (i = 0; i < datasetItem.modes.length; i++) {
                    if (datasetItem.modes[i] === "sparql11update")
                        return;
                }
            }

            if (datasetItem.classes == null) {
                activeDataItem = datasetItem;
                this.showActiveTab();
                var paramsData = {};
                paramsData[config.defaultEndpointParameters.queryParameters.query] = "SELECT DISTINCT ?o WHERE {?s a ?o} ORDER BY ?o LIMIT 1000";
                $
                        .ajax({
                            url : datasetItem.uri,
                            data : paramsData,
                            type : 'post',
                            headers : {
                                "Accept" : "application/sparql-results+json"
                            },
                            dataType : 'json',
                            error : function(XMLHttpRequest, textStatus, errorThrown) {
                                editor.getErrorBox().show(
                                        "Classes cannot be retrieved. HTTP Status: "
                                                + XMLHttpRequest.status + ", " + errorThrown);
                            },
                            success : function(data) {
                                datasetItem.classes = data;
                                if (activeTab === "Classes") {
                                    displayClasses();
                                }
                                calcPrefixes();
                                if (activeTab === "Prefixes") {
                                    displayPrefixes();
                                }
                                if (config.maxClasses !== undefined && datasetItem.classes.results.bindings.length == config.maxClasses) {
                                    window
                                            .alert("The maximum number of classes has been reached - " + config.maxClasses);
                                }
                            }
                        });
            } else {
                activeDataItem = datasetItem;
                if (activeTab === "Classes") {
                    displayClasses();
                }
                calcPrefixes();
                if (activeTab === "Prefixes") {
                    displayPrefixes();
                }
            }
        } catch (e) {
            editor.getErrorBox().show(e);
        }
    };
}

module.exports = FlintSidebar

