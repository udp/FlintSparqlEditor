
var Flint = require('./flint')

function FlintEditor(container, imagesPath, config) {

	"use strict";

	var editor;

	if (config.endpoints === null) {
		window.alert("There must be at least one endpoint defined");
		return;
	}

	editor = new Flint(container, imagesPath, config);

	this.getEditor = function() {
		return editor;
	};

}

module.exports = FlintEditor

