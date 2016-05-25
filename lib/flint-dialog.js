
var $ = require('./jquery')

function FlintDialog(editor) {

    var button = "";
    var closeAction = {};

    this.show = function(title, text, closeOnly) {

        if (!editor.windowClosing) {
            $('#flint-dialog-title-text').text(title);
            $('#flint-dialog-text').html(text);
            if (closeOnly) {
                $('#flint-dialog-okay-button').css('visibility', 'hidden');
            } else {
                $('#flint-dialog-okay-button').css('visibility', 'visible');
            }
            $('.flint-dialog-body').css('margin-top',
                    ($('#flint-editor').position().top + 200) + "px");
            $('#flint-dialog').css('visibility', 'visible');
        }
    };

    this.getResult = function() {
        return button;
    };

    this.setCloseAction = function(callback) {
        if (callback !== null) {
            closeAction = callback;
        } else {
            closeAction = function() {
            };
        }
    };

    this.display = function(container) {
        var aboutText = "<div id='flint-dialog'' class='flint-dialog'><div class='flint-dialog-body'><div class='flint-dialog-body-container'><h2 id='flint-dialog-title'><span id='flint-dialog-close' class='flint-close'></span><span id='flint-dialog-title-text'>Title goes here</span></h2>"
                + "<div id='flint-dialog-text'></div>"
                + "<div id='flint-dialog-buttons'><span id='flint-dialog-close-button' class='flint-close-button''>Close</span><span id='flint-dialog-okay-button' class='flint-okay-button'>Okay</span></div>"
                + "</div></div></div>";
        $('#' + container).append(aboutText);

        $('#flint-dialog-close').click(function() {
            $('#flint-dialog-okay-button').css('visibility', 'hidden');
            $('#flint-dialog').css('visibility', 'hidden');
            button = "Close";
            closeAction();
        });
        $('#flint-dialog-okay-button').click(function() {
            try {
                $('#flint-dialog-okay-button').css('visibility', 'hidden');
                $('#flint-dialog').css('visibility', 'hidden');
                button = "Okay";
                closeAction();
            } catch (e) {
                editor.getErrorBox().show(e);
            }
        });
        $('#flint-dialog-close-button').click(function() {
            $('#flint-dialog-okay-button').css('visibility', 'hidden');
            $('#flint-dialog').css('visibility', 'hidden');
            button = "Close";
            closeAction();
        });
    };
}

module.exports = FlintDialog

