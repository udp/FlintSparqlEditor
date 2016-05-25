
function FlintToolbarItem(itemId, itemLabel, itemIcon, itemEnabled,
        itemCallback, itemStartGroup) {

    var id = itemId;
    var label = itemLabel;
    var icon = itemIcon;
    var callback = itemCallback;
    var enabled = itemEnabled;
    var startGroup = itemStartGroup;

    this.getId = function() {
        return id;
    };
    this.getLabel = function() {
        return label;
    };
    this.getIcon = function() {
        return icon;
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
    this.getStartGroup = function() {
        return startGroup;
    };
}

module.exports = FlintToolbarItem

