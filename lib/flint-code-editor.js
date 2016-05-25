
var CodeMirror = require('./codemirror')

var $ = require('./jquery')

function FlintCodeEditor(flint, editorMode) {

    var initialQuery = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\nSELECT * WHERE {\n   ?s ?p ?o\n}\nLIMIT 10";
    var cm;
    var spaceForTabsCount = 0;
    var tabOffset = 0;
    var textMarkerHandle = null
    var tabItems = [];
    var activeTab = 0;
    var tabsCount = 0;
    var codeEditor = this;
    var queryType = "";

    this.getTitle = function() {
        return "";
    };

    // ----------------------------------------------------------------
    // Autocompletion code, based on the example for javascript

    function stopEvent() {
        if (this.preventDefault) {
            this.preventDefault();
            this.stopPropagation();
        } else {
            this.returnValue = false;
            this.cancelBubble = true;
        }
    }

    function addStop(event) {
        if (!event.stop) {
            event.stop = stopEvent;
        }
        return event;
    }

    function connect(node, type, handler) {

        function wrapHandler(event) {
            handler(addStop(event || window.event));
        }

        if (typeof node.addEventListener == "function") {
            node.addEventListener(type, wrapHandler, false);
        } else {
            node.attachEvent("on" + type, wrapHandler);
        }
    }

    function forEach(arr, f) {
        var i;
        var e;
        for (i = 0, e = arr.length; i < e; ++i) {
            f(arr[i]);
        }
    }

    function memberChk(el, arr) {
        var i;
        var e;
        for (i = 0, e = arr.length; i < e; ++i) {
            if (arr[i] == el) {
                return (true);
            }
        }
        return false;
    }

    // Extract context info needed for autocompletion / keyword buttons
    // based on cursor position
    function getPossiblesAtCursor() {
        // We want a single cursor position.
        if (cm.somethingSelected()) {
            return;
        }
        // Find the token at the cursor
        var cur = cm.getCursor(false);
        var cur1 = {
            line : cur.line,
            ch : cur.ch
        };

        // Before cursor
        var charBefore = cm.getRange({
            line : cur.line,
            ch : cur.ch - 1
        }, {
            line : cur.line,
            ch : cur.ch
        });

        // Cursor position on the far left (ch=0) is problematic
        // - if we ask CodeMirror for token at this position, we don't
        // get back the token at the beginning of the line
        // - hence use adjusted position cur1 to recover this token.
        if (cur1.ch == 0 && cm.lineInfo(cur1.line).text.length > 0) {
            cur1.ch = 1;
        }
        var token = cm.getTokenAt(cur1);
        var charAfter;
        var possibles = null;
        var start = token.string.toLowerCase();
        var insertPos = null;
        var insertEnd = false;
        var insertStart = false;

        // if the token is whitespace, use empty string for matching
        // and set insertPos, so that selection will be inserted into
        // into space, rather than replacing it.
        if (token.className == "sp-ws") {
            start = "";
            // charAfter is char after cursor
            charAfter = cm.getRange({
                line : cur.line,
                ch : cur.ch
            }, {
                line : cur.line,
                ch : cur.ch + 1
            });
            insertPos = cur;
        } else {
            // charAfter is char after end of token
            charAfter = cm.getRange({
                line : cur.line,
                ch : token.end
            }, {
                line : cur.line,
                ch : token.end + 1
            });
            if (token.className != "sp-invalid"
                    && token.className != "sp-prefixed"
                    && (token.string != "<" || !memberChk("IRI_REF",
                            token.state.possibleCurrent))
            // OK when "<" is start of URI
            ) {
                if (token.end == cur.ch && token.end != 0) {
                    insertEnd = true;
                    start = "";
                    insertPos = cur;
                } else if (token.start == cur.ch) {
                    insertStart = true;
                    start = "";
                    insertPos = cur;
                }
            }
        }

        if (token.className === "sp-comment") {
            possibles = [];
        } else {
            if (cur1.ch > 0 && !insertEnd) {
                possibles = token.state.possibleCurrent;
            } else {
                possibles = token.state.possibleNext;
            }
        }

        return {
            "token" : token, // codemirror token object
            "possibles" : possibles, // array of possibles terminals from
            // grammar
            "insertPos" : insertPos, // Position in line to insert text,
            // or null if replacing existing
            // text
            "insertStart" : insertStart, // true if position of insert
            // adjacent to start of a non-ws
            // token
            "insertEnd" : insertEnd, // true if ... ... end of a ...
            "charAfter" : charAfter, // char found straight after cursor
            "cur" : cur, // codemirror {line,ch} object giving pos of
            // cursor
            "start" : start
        // Start of token for autocompletion
        };
    }

    var keywords = /^(GROUP_CONCAT|DATATYPE|BASE|PREFIX|SELECT|CONSTRUCT|DESCRIBE|ASK|FROM|NAMED|ORDER|BY|LIMIT|ASC|DESC|OFFSET|DISTINCT|REDUCED|WHERE|GRAPH|OPTIONAL|UNION|FILTER|GROUP|HAVING|AS|VALUES|LOAD|CLEAR|DROP|CREATE|MOVE|COPY|SILENT|INSERT|DELETE|DATA|WITH|TO|USING|NAMED|MINUS|BIND|LANGMATCHES|LANG|BOUND|SAMETERM|ISIRI|ISURI|ISBLANK|ISLITERAL|REGEX|TRUE|FALSE|UNDEF|ADD|DEFAULT|ALL|SERVICE|INTO|IN|NOT|IRI|URI|BNODE|RAND|ABS|CEIL|FLOOR|ROUND|CONCAT|STRLEN|UCASE|LCASE|ENCODE_FOR_URI|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|NOW|UUID|STRUUID|MD5|SHA1|SHA256|SHA384|SHA512|COALESCE|IF|STRLANG|STRDT|ISNUMERIC|SUBSTR|REPLACE|EXISTS|COUNT|SUM|MIN|MAX|AVG|SAMPLE|SEPARATOR|STR)$/i;
    var punct = /^(\*|\.|\{|\}|,|\(|\)|;|\[|\]|\|\||&&|=|!=|!|<=|>=|<|>|\+|-|\/|\^\^|\?|\||\^)$/;
    function getCompletions(token, start, possibles) {

        var found = [];

        var state = token.state;
        var stack = state.stack;
        var top = stack.length - 1;
        var topSymbol = stack[top];

        // Skip optional clutter
        while (/^(\*|\?).*/.test(topSymbol) && top > 0) {
            topSymbol = stack[--top];
        }

        var lastProperty = token.state.lastProperty;
        // Is a class expected in this position?
        // If the preceding property was rdf:type and an object is expected,
        // then a class is expected.
        var isClassPos = false;
        if (lastProperty
                .match(/^a|rdf:type|<http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type>$/)
                && ((start == "" && (topSymbol == "object"
                        || topSymbol == "objectList" || topSymbol == "objectListPath")) || (start != "" && topSymbol == "}"))) {
            isClassPos = true;
        }

        // test the case of the 1st non-space char
        var startIsLowerCase = /^ *[a-z]/.test(token.string);

        // Where case is flexible
        function maybeAdd(str) {
            if (str.toUpperCase().indexOf(start.toUpperCase()) === 0) {
                if (startIsLowerCase) {
                    found.push(str.toLowerCase());
                } else {
                    found.push(str.toUpperCase());
                }
            }
        }

        // Where case is not flexible
        function maybeAddCS(str) {
            if (str.toUpperCase().indexOf(start.toUpperCase()) === 0) {
                found.push(str);
            }
        }

        // Add items from the fetched sets of properties / classes
        // set is "properties" or "classes"
        // varName is "p" or "o"
        function addFromCollectedURIs(set, varName) {
            if (/:/.test(start)) {
                // Prefix has been entered - give items matching prefix
                var activeDataItem = editor.getSidebar().getActiveDataItem();
                if (activeDataItem) {
                    for ( var k = 0; k < activeDataItem.prefixes.length; k++) {
                        var ns = activeDataItem.prefixes[k].uri;
                        for ( var j = 0; j < activeDataItem[set].results.bindings.length; j++) {
                            var fragments = activeDataItem[set].results.bindings[j][varName].value
                                    .match(/(^\S*[#\/])([^#\/]*$)/);
                            if (fragments.length == 3 && fragments[1] == ns)
                                maybeAddCS(activeDataItem.prefixes[k].prefix + ":"
                                        + fragments[2]);
                        }
                    }
                }
            } else if (/^</.test(start)) {
                // Looks like a URI - add matching URIs
                var activeDataItem = editor.getSidebar().getActiveDataItem();
                if (activeDataItem) {
                    for ( var j = 0; j < activeDataItem[set].results.bindings.length; j++)
                        maybeAddCS("<"
                                + activeDataItem[set].results.bindings[j][varName].value
                                + ">");
                }
            }
        }

        function gatherCompletions() {
            var i;
            var j;
            var activeDataItem;
            if (isClassPos)
                addFromCollectedURIs("classes", "o");
            for (i = 0; i < possibles.length; ++i) {
                if (possibles[i] == "VAR1" && state.allowVars) {
                    maybeAddCS("?");
                } else if (keywords.exec(possibles[i])) {
                    // keywords - the strings stand for themselves
                    maybeAdd(possibles[i]);
                } else if (punct.exec(possibles[i])) {
                    // punctuation - the strings stand for themselves
                    maybeAddCS(possibles[i]);
                } else if (possibles[i] == "STRING_LITERAL1") {
                    maybeAddCS('"');
                    maybeAddCS("'");
                } else if (possibles[i] == "IRI_REF" && !/^</.test(start)) {
                    maybeAddCS("<");
                } else if (possibles[i] == "BLANK_NODE_LABEL" && state.allowBnodes) {
                    maybeAddCS("_:");
                } else if (possibles[i] == "a") {
                    // Property expected here - fetch possibilities
                    maybeAddCS("a");
                    addFromCollectedURIs("properties", "p");
                } else if (possibles[i] == "PNAME_LN" && !/:$/.test(start)) {
                    // prefixed names - offer prefixes
                    activeDataItem = editor.getSidebar().getActiveDataItem();
                    if (activeDataItem !== undefined
                            && activeDataItem.prefixes != undefined
                            && activeDataItem.prefixes.length) {
                        for (j = 0; j < activeDataItem.prefixes.length; j++) {
                            maybeAddCS(activeDataItem.prefixes[j].prefix + ":");
                        }
                    }
                }
            }
        }

        gatherCompletions();
        return found;
    }

    function insertOrReplace(str, tkposs) {
        if ((tkposs.insertStart || tkposs.charAfter !== " ")
                && /^[A-Za-z\*]*$/.exec(str)) {
            str = str + " ";
        }
        if (tkposs.insertEnd) {
            str = " " + str;
        }
        if (tkposs.insertPos) {
            // Insert between spaces
            cm.replaceRange(str, tkposs.insertPos);
        } else {
            // Replace existing token
            cm.replaceRange(str, {
                line : tkposs.cur.line,
                ch : tkposs.token.start
            }, {
                line : tkposs.cur.line,
                ch : tkposs.token.end
            });
        }
    }

    function startComplete() {

        // We want a single cursor position.
        if (cm.somethingSelected()) {
            return;
        }

        var tkposs = getPossiblesAtCursor();
        var stack = tkposs.token.state.stack;

        var completions = getCompletions(tkposs.token, tkposs.start,
                tkposs.possibles);

        if (!completions.length) {
            return;
        }

        // When there is only one completion, use it directly.
        if (completions.length === 1) {
            insertOrReplace(completions[0], tkposs);
            return true;
        }

        // Build the select widget
        var complete = document.createElement("div");
        complete.className = "completions";
        var sel = complete.appendChild(document.createElement("select"));
        sel.multiple = true;
        var i;
        for (i = 0; i < completions.length; ++i) {
            var opt = sel.appendChild(document.createElement("option"));
            opt.appendChild(document.createTextNode(completions[i]));
        }
        sel.firstChild.selected = true;
        sel.size = Math.min(10, completions.length);
        var pos = cm.cursorCoords();

        complete.style.position = "absolute";
        complete.style.left = pos.x + "px";
        complete.style.top = pos.yBot + "px";

        document.body.appendChild(complete);

        // Hack to hide the scrollbar.
        if (completions.length <= 10) {
            complete.style.width = (sel.clientWidth - 1) + "px";
        }

        var done = false;
        function close() {
            if (done) {
                return;
            }
            done = true;
            complete.parentNode.removeChild(complete);
        }
        function pick() {
            insertOrReplace(sel.options[sel.selectedIndex].value, tkposs);
            close();
            setTimeout(function() {
                cm.focus();
            }, 50);
        }
        connect(sel, "blur", close);
        connect(sel, "keydown", function(event) {
            var code = event.keyCode;
            // Enter and space
            if (code === 13 || code === 32) {
                event.stop();
                pick();
            }
            // Escape
            else if (code === 27) {
                event.stop();
                close();
                cm.focus();
            } else if (code !== 38 && code !== 40) {
                close();
                cm.focus();
                setTimeout(startComplete, 50);
            }
        });
        connect(sel, "dblclick", pick);

        sel.focus();
        // Opera sometimes ignores focusing a freshly created node
        if (window.opera) {
            setTimeout(function() {
                if (!done) {
                    sel.focus();
                }
            }, 100);
        }
        return true;
    }

    function autocompleteKeyEventHandler(i, e) {
        // Hook into ctrl-space
        if (e.keyCode == 32 && (e.ctrlKey || e.metaKey) && !e.altKey) {
            e.preventDefault();
            return startComplete();
        }
    }

    function cmUpdate() {

        if (textMarkerHandle !== null) {
            textMarkerHandle.clear()
        }

        var state;
        var l;
        for (l = 0; l < cm.lineCount(); ++l) {
            state = cm.getTokenAt({
                line : l,
                ch : cm.getLine(l).length
            }).state;
            if (state.OK === false) {

                cm.setGutterMarker(l, 'error-gutter',
                      $("<span style=\"color: #f00 ; font-size: large;\">&rarr;</span> %N%")[0])

                textMarkerHandle = cm.markText({
                    className: 'sp-error',
                    line : l,
                    ch : state.errorStartPos
                }, {
                    className: 'sp-error',
                    line : l,
                    ch : state.errorEndPos
                })
                break;
            } else {
                cm.setGutterMarker(l, 'error-gutter', null)
            }
        }

        if (state.complete) {
            // Coolbar submit item
            flint.getCoolbar().getItems()[2].enable();
            // Endpoint bar submit item
            flint.getEndpointBar().getItems()[1].enable();
            flint.getStatusArea().setQueryValid(true);
        } else {
            flint.getCoolbar().getItems()[2].disable();
            flint.getEndpointBar().getItems()[1].disable();
            flint.getStatusArea().setQueryValid(false);
        }

        // Dataset bar MIME type selection
        flint.getCoolbar().getItems()[3].setQueryType(state.queryType);
        // Endpoint bar MIME type selection
        flint.getEndpointBar().getItems()[3].setQueryType(state.queryType);
        flint.getStatusArea().updateStatus();
        if (state.queryType) {
            queryType = state.queryType.toUpperCase();
        } else {
            queryType = "";
        }
    }

    // Enable/disable the keyword buttons depending on the possibilities at
    // cursor position
    function updateKeywordTable() {

        var tkposs = getPossiblesAtCursor();

        function getButtonFn(str) {
            return function(e) {
                insertOrReplace(str, tkposs);
                cm.focus();
                e.stopPropagation();
            };
        }

        if (tkposs && tkposs.possibles) {
            // Update keywords in the sidebar
            flint.getSidebar().updateKeywords(tkposs.possibles, getButtonFn);
        }
    }

    function cmCursor() {

        updateKeywordTable();

        if (cm.somethingSelected() != "") {
            if (flint.getToolbar)
                flint.getToolbar().setEnabled("Cut", true);
            if (flint.getMenu)
                flint.getMenu().setEnabled("Cut", true);
        } else {
            if (flint.getToolbar)
                flint.getToolbar().setEnabled("Cut", false);
            if (flint.getMenu)
                flint.getMenu().setEnabled("Cut", false);
        }
        
        if (cm.historySize().undo > 0) {
            if (flint.getToolbar)
                flint.getToolbar().setEnabled("Undo", true);
            if (flint.getMenu)
                flint.getMenu().setEnabled("Undo", true);
        } else {
            if (flint.getToolbar)
                flint.getToolbar().setEnabled("Undo", false);
            if (flint.getMenu)
                flint.getMenu().setEnabled("Undo", false);
        }
        
        if (cm.historySize().redo > 0) {
            if (flint.getToolbar)
                flint.getToolbar().setEnabled("Redo", true);
            if (flint.getMenu)
                flint.getMenu().setEnabled("Redo", true);
        } else {
            if (flint.getToolbar)
                flint.getToolbar().setEnabled("Redo", false);
            if (flint.getMenu)
                flint.getMenu().setEnabled("Redo", false);
        }

        flint.getStatusArea().setLine(cm.getCursor().line);
        flint.getStatusArea().setPosition(cm.getCursor().ch);
        flint.getStatusArea().updateStatus();
    }

    this.setCodeMode = function(editorMode) {
        cm.setOption("mode", editorMode);
        updateKeywordTable();
    };

    this.getCodeMirror = function() {
        return cm;
    };

    this.getQueryType = function() {
        return queryType;
    };

    // Calculate number of tabs actually displayed
    function getFunctioningTabs() {
        var functioning = 0;
        var i;
        for (i = 0; i < tabItems.length; i++) {
            if (tabItems[i] != null) {
                functioning++;
            }
        }
        return functioning;
    }

    function storeCurrentTab() {
        var currentTabContent = cm.getValue();
        tabItems[activeTab].setText(currentTabContent);
        tabItems[activeTab].setCursor(cm.getCursor().line, cm.getCursor().ch);
    }

    function displayCurrentTab() {
        var currentTabItem = tabItems[activeTab];
        cm.setValue(currentTabItem.getText());
        cm.setCursor(currentTabItem.getLine(), currentTabItem.getCh());
        $('#flint-editor-tabs li').attr("class", "flint-editor-tab");
        $('#flint-tab-' + (activeTab + 1)).attr("class",
                "flint-editor-tab-selected");
        cm.focus();
    }

    function closeTab(tabIndex) {
        $('#flint-tab-' + tabIndex).remove();
        // If we're closing the current tab we need to display another
        tabItems[tabIndex - 1] = null;
        var foundTab = false;
        var i;
        for (i = 0; i < tabItems.length; i++) {
            if (tabItems[i] != null) {
                activeTab = i;
                foundTab = true;
                break;
            }
        }
        // Always ensure we have at least one query tab
        if (!foundTab) {
            codeEditor.addTab("");
        } else {
            if (tabOffset > 0) {
                tabOffset--;
                $('#flint-editor-tabs li:eq(' + tabOffset + ')').show();
            }
            displayCurrentTab();
        }
        checkTabScroll();
    }

    function checkTabScroll() {
        var functioningTabs = getFunctioningTabs();
        var containerWidth = $('#flint-editor-tabs').width();
        if (containerWidth < (functioningTabs * 102)) {
            if (tabOffset > 0) {
                $('#flint-scroll-tabs-left').css('opacity', 1);
            } else {
                $('#flint-scroll-tabs-left').css('opacity', 0.5);
            }
            if (tabOffset < (functioningTabs - spaceForTabsCount)) {
                $('#flint-scroll-tabs-right').css('opacity', 1);
            } else {
                $('#flint-scroll-tabs-right').css('opacity', 0.5);
            }
        } else {
            $('#flint-scroll-tabs-left').css('opacity', 0.5);
            $('#flint-scroll-tabs-right').css('opacity', 0.5);
        }
    }

    this.addTab = function(content) {
        if ($('#flint-editor-tabs li').length > 0) {
            storeCurrentTab();
        }
        if (content == null) {
            content = "";
        }
        tabItems.push(new FlintEditItem(content));
        tabsCount++;
        $('#flint-editor-tabs')
                .append(
                        "<li class='flint-editor-tab' id='flint-tab-"
                                + tabsCount
                                + "'>Query "
                                + tabsCount
                                + "<span class='flint-tab-close' title='Close this tab'></span></li>");
        activeTab = tabsCount - 1;
        displayCurrentTab();
        $('#flint-editor-tabs li:last-child').click(function(tabIndex) {
            return function() {
                storeCurrentTab();
                activeTab = tabIndex - 1;
                displayCurrentTab();
            };
        }(tabsCount));
        $('#flint-editor-tabs li:last-child .flint-tab-close').click(
                function(tabIndex) {
                    return function() {
                        closeTab(tabIndex);
                    };
                }(tabsCount));
        checkTabScroll();
    };

    // If window has been resize recalculate display of some components
    this.resize = function() {
        var containerWidth = $('#flint-editor-tabs-container').width();
        $('#flint-editor-tabs').css('max-width', containerWidth - 70);
        spaceForTabsCount = Math.floor((containerWidth - 70) / 102);
        tabOffset = 0;
        $('#flint-editor-tabs li').show();
        checkTabScroll();
    };

    this.display = function(container) {
        $('#' + container)
                .append(
                        "<div id='flint-editor-container'><div id='flint-editor-tabs-container'><div id='flint-scroll-tabs-left'><img src='"
                                + flint.getImagesPath()
                                + "/Previous.png'/></div>"
                                + "<ul id='flint-editor-tabs'></ul>"
                                + "<div id='flint-scroll-tabs-right'><img src='"
                                + flint.getImagesPath()
                                + "/Next.png'/></div></div>"
                                + "<textarea id='flint-code' name='query' cols='100' rows='1'>"
                                + initialQuery + "</textarea></div>");

        cm = CodeMirror.fromTextArea(document.getElementById("flint-code"), {
            mode : editorMode,
            lineNumbers : true,
            indentUnit : 3,
            tabMode : "indent",
            matchBrackets : true,
            gutters: [ 'error-gutter', 'CodeMirror-linenumbers' ]
        });

        cm.on('keydown', autocompleteKeyEventHandler)
        cm.on('cursorActivity', cmCursor)
        cm.on('change', cmUpdate)

        this.addTab(initialQuery);
        var containerWidth = $('#flint-editor-tabs-container').width();
        $('#flint-editor-tabs').css('max-width', containerWidth - 70);

        $('#flint-scroll-tabs-left').click(function() {
            if (tabOffset > 0 && $('#flint-scroll-tabs-left').css('opacity') == 1) {
                tabOffset--;
                $('#flint-editor-tabs li:eq(' + tabOffset + ')').show();
                checkTabScroll();
            }
        });

        $('#flint-scroll-tabs-right').click(
                function() {
                    var functioningTabs = getFunctioningTabs();
                    if (tabOffset < (functioningTabs - spaceForTabsCount)
                            && $('#flint-scroll-tabs-right').css('opacity') == 1) {
                        tabOffset++;
                        $('#flint-editor-tabs li:lt(' + tabOffset + ')').hide();
                        checkTabScroll();
                    }
                });

    };

    // Stores all the information for an editor tab item
    function FlintEditItem(text) {

        var content = text;
        var cursorLine = 0;
        var cursorCh = 0;

        this.setText = function(text) {
            content = text;
        };

        this.getText = function() {
            return content;
        };

        this.getLine = function() {
            return cursorLine;
        };

        this.getCh = function() {
            return cursorCh;
        };

        this.setCursor = function(line, ch) {
            cursorLine = line;
            cursorCh = ch;
        };
    }

}

module.exports = FlintCodeEditor

