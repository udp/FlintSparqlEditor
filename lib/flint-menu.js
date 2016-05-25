
var FlintMenuItem = require('./flint-menu-item')

var $ = require('./jquery')

function FlintMenu(editor) {

    var menuItems = [];
    var newMenuItems = [];

    try {
        newMenuItems.push(new FlintMenuItem("NewTab", "New Query Tab",
                "NewTab_16x16.png", true, function() {
                    editor.addTab();
                }));
        newMenuItems.push(new FlintMenuItem("EmptyQuery", "Empty Query",
                "New_16x16.png", true, function() {
                    editor.clearEditorTextArea();
                }));
        newMenuItems.push(new FlintMenuItem("SelectQuery", "Select",
                "Properties_16x16.png", true, function() {
                    editor.insertSelectQuery();
                }));
        newMenuItems.push(new FlintMenuItem("ConstructQuery", "Construct",
                "Key_16x16.png", true, function() {
                    editor.insertConstructQuery();
                }));
        newMenuItems.push(new FlintMenuItem("InsertQuery", "Insert",
                "Insert_16x16.png", true, function() {
                    editor.insertInsertQuery();
                }));
        newMenuItems.push(new FlintMenuItem("DeleteQuery", "Delete",
                "DeleteQuery_16x16.png", true, function() {
                    editor.insertDeleteQuery();
                }));

        var editMenuItems = [];
        editMenuItems.push(new FlintMenuItem("Undo", "Undo", "Undo_16x16.png",
                false, function() {
                    editor.undo();
                }));
        editMenuItems.push(new FlintMenuItem("Redo", "Redo", "Redo_16x16.png",
                false, function() {
                    editor.redo();
                }));
        editMenuItems.push(new FlintMenuItem("Cut", "Cut", "Cut_16x16.png",
                false, function() {
                    editor.cut();
                }));

        var viewMenuItems = [];
        viewMenuItems.push(new FlintMenuItem("Show Tools", "Show Tools Pane",
                "Prev_16x16.png", true, function() {
                    editor.toggleTools();
                }));
        viewMenuItems.push(new FlintMenuItem("Hide Tools", "Hide Tools Pane",
                "Next_16x16.png", false, function() {
                    editor.toggleTools();
                }));
        viewMenuItems.push(new FlintMenuItem("Show Endpoints",
                "Show Endpoints Bar", "Globe_16x16.png", true, function() {
                    editor.showEndpointBar();
                }));
        viewMenuItems.push(new FlintMenuItem("Show Datasets",
                "Show Datasets Bar", "Favorites_16x16.png", false, function() {
                    editor.showDataSetsBar();
                }));

        var helpMenuItems = [];
        helpMenuItems.push(new FlintMenuItem("About", "About",
                "Information_16x16.png", true, function() {
                    editor.showAbout();
                }));

        var newMenuItem = new FlintMenuItem("New", "New", true);
        newMenuItem.setSubMenu(newMenuItems);
        menuItems.push(newMenuItem);

        var editMenuItem = new FlintMenuItem("Edit", "Edit", true);
        editMenuItem.setSubMenu(editMenuItems);
        menuItems.push(editMenuItem);

        var viewMenuItem = new FlintMenuItem("View", "View", true);
        viewMenuItem.setSubMenu(viewMenuItems);
        menuItems.push(viewMenuItem);

        var helpMenuItem = new FlintMenuItem("Help", "Help", true);
        helpMenuItem.setSubMenu(helpMenuItems);
        menuItems.push(helpMenuItem);

        this.getItems = function() {
            return menuItems;
        };
    } catch (e) {
        editor.getErrorBox().show(e);
    }

    this.setEnabled = function(id, enabled) {
        var i;
        var j;
        for (i = 0; i < menuItems.length; i++) {
            if (menuItems[i].getSubMenu() !== null) {
                for (j = 0; j < menuItems[i].getSubMenu().length; j++) {
                    if (menuItems[i].getSubMenu()[j].getId() === id) {
                        menuItems[i].getSubMenu()[j].setEnabled(enabled);
                        if (enabled) {
                            $("#flint-submenu-item-" + i + "-" + j).attr("class",
                                    "flint-menu-enabled");
                        } else {
                            $("#flint-submenu-item-" + i + "-" + j).attr("class",
                                    "flint-menu-disabled");
                        }
                        break;
                    }
                }
            }
        }
    };

    this.display = function(container) {
        var listItems = "";
        var i;
        var j;
        for (i = 0; i < menuItems.length; i++) {
            listItems += "<li class='flint-menu-item' id='flint-menu-" + i
                    + "'><span>";
            listItems += menuItems[i].getLabel();
            listItems += "</span>";
            if (menuItems[i].getSubMenu() !== null) {
                var subList = "";
                for (j = 0; j < menuItems[i].getSubMenu().length; j++) {
                    subList += "<li class='";
                    if (menuItems[i].getSubMenu()[j].getEnabled()) {
                        subList += "flint-menu-enabled";
                    } else {
                        subList += "flint-menu-disabled";
                    }
                    subList += "' id='flint-submenu-item-" + i + "-" + j + "'><span>";
                    if (menuItems[i].getSubMenu()[j].getIcon() !== "") {
                        subList += "<img src='" + editor.getImagesPath() + "/"
                                + menuItems[i].getSubMenu()[j].getIcon() + "'/>";
                    } else {
                        subList += "<span class='flint-menu-filler'></span>";
                    }
                    subList += menuItems[i].getSubMenu()[j].getLabel();
                    subList += "</span></li>";
                }
                listItems += "<ul class='flint-submenu' id='flint-submenu-" + i
                        + "'>" + subList + "</ul>";
            }
            listItems += "</li>";
        }
        $('#' + container).append("<ul id='flint-menu'>" + listItems + "</ul>");

        // Now add events
        for (i = 0; i < menuItems.length; i++) {
            if (menuItems[i].getSubMenu() !== null) {
                for (j = 0; j < menuItems[i].getSubMenu().length; j++) {
                    $("#flint-submenu-item-" + i + "-" + j).click(
                            menuItems[i].getSubMenu()[j].getCallback());
                }
            }
        }
    };
}

module.exports = FlintMenu


