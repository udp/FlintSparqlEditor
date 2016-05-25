
Fork of the [Flint SPARQL Editor](http://openuplabs.tso.co.uk/demos/sparqleditor).

From Flint 1.0.3, this fork has:

* Updated jQuery from 1.5.2 to 2.2.4
* Updated CodeMirror from 2.01 to 5.15.2
* Moved hardcoded max classes/properties settings to the config
* Split up huge flint-editor.js into > 20 separate files
* Moved to browserify and CommonJS modules to bundle dependencies

Regressions:

* Dropped support for old versions of IE 
* Autocomplete isn't yet working properly since CodeMirror upgrade


Building
--------

Install [browserify](http://browserify.org).  Then:

    npm install
    browserify browser.js -o dist/flint.js



