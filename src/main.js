document.addEventListener("DOMContentLoaded", function(event) {

  var componentManager;
  var workingNote, clientData, lastValue;
  var editor;
  var ignoreTextChange = false;
  var initialLoad = true;

  function loadComponentManager() {
    var permissions = [{name: "stream-context-item"}]
    componentManager = new ComponentManager(permissions, function(){
      // on ready
    });

    componentManager.streamContextItem((note) => {
      onReceivedNote(note);
    });
  }

  function save() {
    if(workingNote) {
      lastValue = editor.getValue();
      workingNote.content.text = lastValue;
      workingNote.clientData = clientData;
      componentManager.replacePendingAndPerformAfterDelay(() => {
        componentManager.saveItem(workingNote);
      })
    }
  }

  function onReceivedNote(note) {
    workingNote = note;

    // Only update UI on non-metadata updates.
    if(note.isMetadataUpdate) {
      return;
    }

    clientData = note.clientData;

    if(editor) {
      if(note.content.text !== lastValue) {
        ignoreTextChange = true;
        editor.getDoc().setValue(workingNote.content.text);
        ignoreTextChange = false;
      }

      if(initialLoad) {
        initialLoad = false;
        editor.getDoc().clearHistory();
      }
    }
  }

  function loadEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById("code"), {
      mode: "markdown",
      lineWrapping: true
    });
    editor.setSize("100%", "100%");

    editor.on("change", function(){
      if(ignoreTextChange) {return;}
      save();
    });
  }

  loadEditor();
  loadComponentManager();
});
