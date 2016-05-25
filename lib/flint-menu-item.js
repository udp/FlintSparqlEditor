
function FlintMenuItem(itemId, itemLabel, itemIcon, itemEnabled, itemCallback) {

    var id = itemId;
    var subMenu = null;
    var icon = itemIcon;
    var callback = itemCallback;
    var enabled = itemEnabled;

    this.getId = function() {
        return id;
    };
    this.getIcon = function() {
        return icon;
    };
    this.getLabel = function() {
        return itemLabel;
    };
    this.setSubMenu = function(menu) {
        subMenu = menu;
    };
    this.getSubMenu = function() {
        return subMenu;
    };
    this.getCallback = function() {
        return callback;
    };
    this.setEnabled = function(value) {
        enabled = value;
    };
    this.getEnabled = function() {
        return enabled;
    };
}

module.exports = FlintMenuItem

