
function FlintError(editor) {

    this.show = function(message) {

        console.error(message)

        try {

            editor.getConfirmDialog().setCloseAction();
            editor.getConfirmDialog().show("Flint Error",
                    "<p>" + message.toString() + "</p>", true);
        } catch (e) {

            console.error(e)

            window.alert(e.stack !== undefined ? e.stack : e);
        }

    };
}

module.exports = FlintError


