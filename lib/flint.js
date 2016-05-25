
var FlintCodeEditor = require('./flint-code-editor')
var FlintError = require('./flint-error')
var FlintMenu = require('./flint-menu')
var FlintToolbar = require('./flint-toolbar')
var FlintSidebar = require('./flint-sidebar')
var FlintEndpointBar = require('./flint-endpoint-bar')
var FlintCoolbar = require('./flint-coolbar')
var FlintAbout = require('./flint-about')
var FlintDialog = require('./flint-dialog')
var FlintResults = require('./flint-results')
var FlintStatus = require('./flint-status')

var keywords = require('./keywords')

var $ = require('./jquery')

function Flint(container, imagesPath, config) {

    var flint = this, editorId = "flint-editor", showResultsInSitu = true, cm, createToolbar, createMenu;

    // Add confirmation dialog
    var confirmDialog = new FlintDialog(this);
    confirmDialog.display(editorId);
    this.getConfirmDialog = function() {
        return confirmDialog;
    };

    // Add errorbox - this reuses the standard Flint dialog
    var errorBox = new FlintError(flint);
    this.getErrorBox = function() {
        return errorBox;
    };

    this.windowClosing = false;

    // Don't display dialogs when navigating away from page
    $(window).bind('beforeunload', function(event) {
        editor.windowClosing = true;
    });

    this.sparql1Keywords = keywords.sparql1Keywords
    this.sparql11Query = keywords.sparql11Query
    this.sparql11Update = keywords.sparql11Update

    // Path to images directory
    this.getImagesPath = function() {
        return imagesPath;
    };

    // Returns the version of the software
    this.getVersion = function() {
        return "1.0.3";
    };

    // Returns the title of the software
    this.getTitle = function() {
        return "Flint SPARQL Editor";
    };

    if ($.browser.msie) {
        $('#' + container).append(
                "<form id='" + editorId + "' action='" + config.endpoints[0].uri
                        + "' method='post'></form>");
    } else {
        $('#' + container).append("<div id='" + editorId + "'></div>");
    }

    $('#' + editorId).append(
            "<h1 id='flint-title'>" + this.getTitle() + " " + this.getVersion()
                    + "</h1>");

    // Add menu
    if (config.interface.menu) {
        createMenu = new FlintMenu(flint);
        createMenu.display(editorId);
        this.getMenu = function() {
            return createMenu;
        };
    }

    // Add toolbar
    if (config.interface.toolbar) {
        createToolbar = new FlintToolbar(flint);
        createToolbar.display(editorId);
        this.getToolbar = function() {
            return createToolbar;
        };
    }

    var createSidebar = new FlintSidebar(flint, config);
    var createEndpointBar = new FlintEndpointBar(config, flint);
    var endpointItem = createEndpointBar.getItems()[0], endpointGetInfoButton = createEndpointBar
            .getItems()[2], endpointMimeTypeItem = createEndpointBar.getItems()[3];

    // Add endpoint bar
    try {
        createEndpointBar.display(editorId);
        this.getEndpointBar = function() {
            return createEndpointBar;
        };

        endpointMimeTypeItem.setQueryType("SELECT");

        endpointGetInfoButton
                .setClickAction(function() {
                    try {
                        var endpointUrl = endpointItem.getEndpoint();
                        // If we haven't already retrieved the data
                        // prompt
                        if (endpointItem.getItem(endpointUrl) === null) {
                            flint.getConfirmDialog().setCloseAction(function() {
                                if (flint.getConfirmDialog().getResult() === "Okay") {
                                    // We'll store the
                                    // data against the
                                    // endpoint URL
                                    endpointItem.addItem();
                                    if (!$.browser.msie) {
                                        var epItem = endpointItem.getItem(endpointUrl);
                                        createSidebar.updateProperties(epItem);
                                        createSidebar.updateClasses(epItem);
                                        createSidebar.updateSamples(epItem);
                                    }
                                }
                            });
                            flint
                                    .getConfirmDialog()
                                    .show(
                                            "Flint Error",
                                            "<p>This operation may take a long time to perform if the dataset contains a large amount of results.</p><p>Do  you want to continue?</p>");
                        }
                    } catch (e) {
                        errorBox.show("Get Dataset Info: " + e);
                    }
                });
    } catch (e) {
        errorBox.show(e);
    }

    // Add coolbar
    var createCoolbar = new FlintCoolbar(config, flint);
    createCoolbar.display(editorId);
    this.getCoolbar = function() {
        return createCoolbar;
    };

    // Add sidebar
    createSidebar.display(editorId);
    createSidebar.showActiveTab();
    this.getSidebar = function() {
        return createSidebar;
    };

    // Set mode related items on toolbar and menu
    this.setModeRelatedItems = function(mode) {

        if (mode === "sparql10" || mode === "sparql11query") {
            if (createToolbar) {
                createToolbar.setEnabled("Select", true);
                createToolbar.setEnabled("Construct", true);
                createToolbar.setEnabled("Insert", false);
                createToolbar.setEnabled("Delete", false);
            }
            if (createMenu) {
                createMenu.setEnabled("SelectQuery", true);
                createMenu.setEnabled("ConstructQuery", true);
                createMenu.setEnabled("InsertQuery", false);
                createMenu.setEnabled("DeleteQuery", false);
            }
        }

        if (mode === "sparql11update") {
            if (createToolbar) {
                createToolbar.setEnabled("Select", false);
                createToolbar.setEnabled("Construct", false);
                createToolbar.setEnabled("Insert", true);
                createToolbar.setEnabled("Delete", true);
            }
            if (createMenu) {
                createMenu.setEnabled("SelectQuery", false);
                createMenu.setEnabled("ConstructQuery", false);
                createMenu.setEnabled("InsertQuery", true);
                createMenu.setEnabled("DeleteQuery", true);
            }
        }
    };

    // Get a handle to the coolbar mode picker item
    var coolbarModeItems = createCoolbar.getItems()[1];
    coolbarModeItems.setChangeAction(function() {
        cm.setCodeMode(coolbarModeItems.getMode());
        flint.setModeRelatedItems(coolbarModeItems.getMode());
        // For updates results formats are implementation specific so
        // don't give option
        if (coolbarModeItems.getMode() === "sparql11update") {
            createCoolbar.getItems()[3].disable();
        } else {
            createCoolbar.getItems()[3].enable();
        }
    });

    // Get a handle to the endpoint bar mode picker item
    var endpointBarModeItems = createEndpointBar.getItems()[4];
    endpointBarModeItems.setChangeAction(function() {
        cm.setCodeMode(endpointBarModeItems.getMode());
        flint.setModeRelatedItems(endpointBarModeItems.getMode());
        // For updates results formats are implementation specific so
        // don't give option
        if (endpointBarModeItems.getMode() === "sparql11update") {
            createEndpointBar.getItems()[3].disable();
        } else {
            createEndpointBar.getItems()[3].enable();
        }
    });

    // Get a handle to the dataset item
    var datasetItems = createCoolbar.getItems()[0];

    datasetItems.setChangeAction(function() {
        if ($.browser.msie) {
            $('#' + editorId).attr('action', datasetItems.getEndpoint());
        } else {
            // Update necessary items with data from configuration
            coolbarModeItems.updateModes(datasetItems.getItem(datasetItems
                    .getEndpoint()));
            createSidebar.updateProperties(datasetItems.getItem(datasetItems
                    .getEndpoint()));
            createSidebar.updateClasses(datasetItems.getItem(datasetItems
                    .getEndpoint()));
            createSidebar.updateSamples(datasetItems.getItem(datasetItems
                    .getEndpoint()));
        }
    });

    // Get a handle to the formats bar
    var datasetMimeTypeItem = createCoolbar.getItems()[3];
    datasetMimeTypeItem.setQueryType("SELECT");

    // Add about box
    var aboutBox = new FlintAbout(flint);

    // Add results area
    var resultsArea;
    if (!$.browser.msie) {
        resultsArea = new FlintResults(flint);
    }

    // Get a handle to the submit button
    var submitItemCoolbar = createCoolbar.getItems()[2];
    var submitItemEndpointBar = createEndpointBar.getItems()[1];

    // Physically set for now but we want this in the configuration so
    // users can override and provide custom submissions
    this.sendDatasetQuery = function() {
        try {
            if (!$.browser.msie) {
                resultsArea.setResults("");
                resultsArea.showLoading(true);
            }
            // Collect query parameters
            var paramsData = {};
            var paramsDataItem = config.defaultEndpointParameters.queryParameters.query;
            if (cm.getQueryType() == 'UPDATE') {
                paramsDataItem = config.defaultEndpointParameters.queryParameters.update;
            }
            paramsData[paramsDataItem] = cm.getCodeMirror().getValue();
            var mimeType = datasetMimeTypeItem.getMimeType();
            $.ajax({
                url : datasetItems.getEndpoint(),
                type : 'post',
                data : paramsData,
                headers : {
                    "Accept" : mimeType
                },
                dataType : 'text',
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    if (XMLHttpRequest.status == 0) {
                        errorBox.show("The request was not sent. You may be offline");
                    } else {
                        errorBox.show("Dataset Request: HTTP Status: "
                                + XMLHttpRequest.status + "; " + textStatus);
                    }
                    resultsArea.showLoading(false);
                },
                success : function(data) {
                    resultsArea.setResults(data);
                }
            });
        } catch (e) {
            errorBox.show("Cannot send dataset query: " + e);
        }
    };

    this.sendEndpointQuery = function() {
        try {
            if (!$.browser.msie) {
                resultsArea.setResults("");
                resultsArea.showLoading(true);
            }
            // Collect query parameters
            var paramsData = {};
            var paramsDataItem = config.defaultEndpointParameters.queryParameters.query;
            if (cm.getQueryType() == 'UPDATE') {
                paramsDataItem = config.defaultEndpointParameters.queryParameters.update;
            }
            paramsData[paramsDataItem] = cm.getCodeMirror().getValue();
            var mimeType = endpointMimeTypeItem.getMimeType();
            $.ajax({
                url : endpointItem.getEndpoint(),
                type : 'post',
                data : paramsData,
                headers : {
                    "Accept" : mimeType
                },
                dataType : 'text',
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    if (XMLHttpRequest.status == 0) {
                        errorBox.show("The request was not sent. You may be offline.");
                    } else {
                        errorBox.show("Endpoint Request: HTTP Status: "
                                + XMLHttpRequest.status + "; " + textStatus);
                    }
                    resultsArea.showLoading(false);
                },
                success : function(data) {
                    resultsArea.setResults(data);
                }
            });
        } catch (e) {
            errorBox.show("Cannot send endpoint query: " + e);
        }
    };

    this.sendIEDatasetQuery = function() {
        $("#" + editorId).attr('action', datasetItems.getEndpoint());
    };

    this.sendIEEndpointQuery = function() {
        $("#" + editorId).attr('action', endpointItem.getEndpoint());
    };

    if (!$.browser.msie) {
        submitItemCoolbar.setSubmitAction(this.sendDatasetQuery);
        submitItemEndpointBar.setSubmitAction(this.sendEndpointQuery);
    } else {
        submitItemCoolbar.setSubmitAction(this.sendIEDatasetQuery);
        submitItemEndpointBar.setSubmitAction(this.sendIEEndpointQuery);
    }

    // Add status area
    var statusArea = new FlintStatus();
    this.getStatusArea = function() {
        return statusArea;
    };

    // Add actual code editing area
    cm = new FlintCodeEditor(flint, "sparql10");
    this.getCodeEditor = function() {
        return cm.getCodeMirror();
    };
    cm.display(editorId);

    statusArea.display(editorId);
    statusArea.updateStatus();
    // Trigger an update to ensure modes and synced with endpoint data
    // item
    coolbarModeItems.updateModes(datasetItems.getItem(datasetItems
            .getEndpoint()));

    // Add tab to editor
    this.addTab = function() {
        cm.addTab();
    };

    // Clear the editor area
    this.clearEditorTextArea = function() {
        if (cm.getCodeMirror().getValue() != "") {
            confirmDialog.setCloseAction(function() {
                var result = confirmDialog.getResult();
                if (result == "Okay") {
                    cm.getCodeMirror().setValue("");
                    cm.getCodeMirror().focus();
                }

            });
            confirmDialog.show("New Query",
                    "<p>Are you sure you want to abandon the current text?</p>");
        }
    };

    this.undo = function() {
        cm.getCodeMirror().undo();
    };

    this.redo = function() {
        cm.getCodeMirror().redo();
    };

    this.cut = function() {
        cm.getCodeMirror().replaceSelection("");
        cm.getCodeMirror().focus();
    };

    this.insert = function(text) {
        cm.getCodeMirror().replaceSelection(text);
        cm.getCodeMirror().focus();
    };

    this.toggleTools = function() {
        $('#flint-sidebar-grabber').click();
    };

    this.showEndpointBar = function() {
        // Important to clear this in case any running HTTP requests
        // have not been finished before switching
        createSidebar.clearActiveItem();
        createSidebar.showActiveTab();
        createCoolbar.hide();
        createEndpointBar.show();
        createToolbar.setEnabled("Show Endpoints", false);
        createToolbar.setEnabled("Show Datasets", true);
        createMenu.setEnabled("Show Endpoints", false);
        createMenu.setEnabled("Show Datasets", true);
        cm.setCodeMode(endpointBarModeItems.getMode());
        var endpointItem = createEndpointBar.getItems()[0];
        var endpointUrl = endpointItem.getEndpoint();
        var item = endpointItem.getItem(endpointUrl);
        createSidebar.updateProperties(item);
        createSidebar.updateClasses(item);
        createSidebar.updateSamples(item);
    };

    this.showDataSetsBar = function() {
        // Important to clear this in case any running HTTP requests
        // have not been finished before switching
        createSidebar.clearActiveItem();
        createSidebar.showActiveTab();
        createCoolbar.show();
        createEndpointBar.hide();
        createToolbar.setEnabled("Show Endpoints", true);
        createToolbar.setEnabled("Show Datasets", false);
        createMenu.setEnabled("Show Endpoints", true);
        createMenu.setEnabled("Show Datasets", false);
        cm.setCodeMode(coolbarModeItems.getMode());
        var item = datasetItems.getItem(datasetItems.getEndpoint());
        createSidebar.updateProperties(item);
        createSidebar.updateClasses(item);
        createSidebar.updateSamples(item);
    };

    this.formatQuery = function() {
        var maxlines = cm.getCodeMirror().lineCount();
        var ln;
        for (ln = 0; ln < maxlines; ++ln) {
            cm.getCodeMirror().indentLine(ln);
        }
    };

    this.insertQuery = function(title, query, line, ch) {
        if (cm.getCodeMirror().getValue() != "") {
            confirmDialog.setCloseAction(function() {
                var result = confirmDialog.getResult();
                if (result == "Okay") {
                    cm.getCodeMirror().setValue(
                            createSidebar.getPrefixes() + "\n" + query);
                    cm.getCodeMirror().setCursor(
                            line + createSidebar.getPrefixCount(), ch);
                    flint.formatQuery();
                    cm.getCodeMirror().focus();
                }
            });
            confirmDialog.show(title,
                    "<p>Are you sure you want to abandon the current text?</p>");
        } else {
            cm.getCodeMirror().setValue(
                    createSidebar.getPrefixes() + "\n" + query);
            cm.getCodeMirror().setCursor(line + createSidebar.getPrefixCount(),
                    ch);
            this.formatQuery();
            cm.getCodeMirror().focus();
        }
    };

    this.insertSelectQuery = function() {
        this.insertQuery("New Select Query",
                "SELECT * WHERE {\n?s ?p ?o\n}\nLIMIT 10", 1, 7);
    };

    this.insertConstructQuery = function() {
        this.insertQuery("New Construct Query",
                "CONSTRUCT {\n?s ?p ?o\n} WHERE {\n?s ?p ?o\n}\nLIMIT 10", 2, 0);
    };

    this.insertInsertQuery = function() {
        this.insertQuery("New Insert Query",
                "INSERT DATA {\nGRAPH <>\n\t{\n\t\t\n\t}\n}", 2, 7);
    };

    this.insertDeleteQuery = function() {
        this
                .insertQuery(
                        "New Delete Query",
                        "DELETE DATA {\n\t<http://example/book2> dc:title 'David Copperfield';\n\t\tdc:creator 'Edmund Wells' .\n}",
                        2, 1);
    };

    this.showAbout = function() {
        aboutBox.show();
    };

    // Handle window resizing
    $(window).resize(function() {
        // Resize editing area. Should this be in the
        // FlintCodeEditor object?
        // Will be triggered by window resize and sidebar
        // display/hiding
        var editorWidth = $('#flint-editor').width();
        if (!createSidebar.visible()) {
            $('.CodeMirror').css("width", (editorWidth - 55) + "px");
        } else {
            $('#flint-sidebar').css("width", editorWidth / 2 + "px");
            $('.CodeMirror').css("width", ((editorWidth / 2) - 25) + "px");
        }
        cm.resize();
    });

    if (!$.browser.msie) {
        resultsArea.display(editorId);
        try {
            createSidebar.updateProperties(datasetItems.getItem(datasetItems
                    .getEndpoint()));
            createSidebar.updateClasses(datasetItems.getItem(datasetItems
                    .getEndpoint()));
            createSidebar.updateSamples(datasetItems.getItem(datasetItems
                    .getEndpoint()));
        } catch (e) {
            errorBox.show(e);
        }
    }

    // Force components to get to their required size
    $(window).resize();
}

module.exports = Flint


