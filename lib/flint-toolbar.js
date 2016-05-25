
var FlintToolbarItem = require('./flint-toolbar-item')

var $ = require('./jquery')

function FlintToolbar(editor) {

    var toolbarItems = [];

    try {
        toolbarItems.push(new FlintToolbarItem("New Query Tab", "New Query Tab",
                "NewTab_24x24.png", true, function() {
                    editor.addTab();
                }, false));
        toolbarItems.push(new FlintToolbarItem("New", "New empty query",
                "New_24x24.png", true, function() {
                    editor.clearEditorTextArea();
                }, true));
        toolbarItems.push(new FlintToolbarItem("Select", "New select query",
                "Properties_24x24.png", true, function() {
                    editor.insertSelectQuery();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Construct",
                "New construct query", "Key_24x24.png", true, function() {
                    editor.insertConstructQuery();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Insert", "New insert query",
                "Insert_24x24.png", true, function() {
                    editor.insertInsertQuery();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Delete", "New delete query",
                "DeleteQuery_24x24.png", true, function() {
                    editor.insertDeleteQuery();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Undo", "Undo last edit",
                "Undo_24x24.png", false, function() {
                    editor.undo();
                }, true));
        toolbarItems.push(new FlintToolbarItem("Redo", "Redo last edit",
                "Redo_24x24.png", false, function() {
                    editor.redo();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Cut", "Cut selected text",
                "Cut_24x24.png", false, function() {
                    editor.cut();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Show Tools", "Show tools pane",
                "Prev_24x24.png", true, function() {
                    editor.toggleTools();
                }, true));
        toolbarItems.push(new FlintToolbarItem("Hide Tools", "Hide tools pane",
                "Next_24x24.png", false, function() {
                    editor.toggleTools();
                }, false));
        toolbarItems.push(new FlintToolbarItem("Show Endpoints",
                "Show endpoints bar", "Globe_24x24.png", true, function() {
                    editor.showEndpointBar();
                }, true));
        toolbarItems.push(new FlintToolbarItem("Show Datasets",
                "Show datasets bar", "Favorites_24x24.png", false, function() {
                    editor.showDataSetsBar();
                }, false));
        // toolbarItems.push(new FlintToolbarItem("FR", "Find/Replace",
        // "Find_24x24.png", true, function() {editor.cut()}));
        this.getItems = function() {
            return toolbarItems;
        };
    } catch (e) {
        editor.getErrorBox().show(e);
    }

    // This is probably a bit inefficient. Need to find a better way
    this.setEnabled = function(id, enabled) {
        var i;
        for (i = 0; i < toolbarItems.length; i++) {
            if (toolbarItems[i].getId() === id) {
                toolbarItems[i].setEnabled(enabled);
                var itemClass = "";
                if (enabled) {
                    itemClass = "flint-toolbar-enabled";
                } else {
                    itemClass = "flint-toolbar-disabled";
                }
                if (toolbarItems[i].getStartGroup()) {
                    itemClass += " flint-toolbar-start";
                }
                $("#flint-toolbar-" + i).attr("class", itemClass);
                break;
            }
        }
    };

    this.display = function(container) {
        var listItems = "";
        var i;
        for (i = 0; i < toolbarItems.length; i++) {
            listItems += "<li id='flint-toolbar-" + i + "' class='";
            if (toolbarItems[i].getEnabled()) {
                listItems += "flint-toolbar-enabled";
            } else {
                listItems += "flint-toolbar-disabled";
            }
            if (toolbarItems[i].getStartGroup()) {
                listItems += " flint-toolbar-start";
            }
            listItems += "'><img src='" + editor.getImagesPath() + "/"
                    + toolbarItems[i].getIcon() + "' title='"
                    + toolbarItems[i].getLabel() + "' alt='"
                    + toolbarItems[i].getLabel() + "'/></li>";
        }
        $('#' + container)
                .append("<ul id='flint-toolbar'>" + listItems + "</ul>");
        for (i = 0; i < toolbarItems.length; i++) {
            $("#flint-toolbar-" + i).click(toolbarItems[i].getCallback());
        }
    };
}

module.exports = FlintToolbar

