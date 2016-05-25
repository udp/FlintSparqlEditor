
function FlintAbout(editor) {

    this.show = function() {
        var aboutText = "<p>"
                + editor.getTitle()
                + ", version "
                + editor.getVersion()
                + "</p>"
                + "<p>Flint uses Marijn Haverbeke's <a href='http://codemirror.net/'>CodeMirror</a>.</p>"
                + "<p>Flint has been developed by a team at <a href='http://www.tso.co.uk'>TSO</a>.</p>";
        editor.getConfirmDialog().setCloseAction();
        editor.getConfirmDialog().show("About Flint", aboutText, true);
    };
}

module.exports = FlintAbout

