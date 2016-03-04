var app = angular.module('MarkdownViewerApp', ['ngMaterial']);
function ensureSize() {
    if(document.getElementById('frame-content')) {
        var toolbar = document.getElementById('toolbar');
        document.getElementById('frame-content').style.height = (document.body.offsetHeight - toolbar.offsetHeight) + 'px';
    }
}


try {
    // this line errors sometimes... not sure why.
    const ipcRenderer = require('electron').ipcRenderer;

    ipcRenderer.on('load-url', function(event, arg) {
        document.getElementById("frame-content").src = arg;
        ensureSize();
    });
    ipcRenderer.on('resize', function(event, arg) {
        ensureSize()
    });

    function sendMessage(type, msg) {
        if(msg === undefined) {
            msg = type;
            type = 'asynchronous-message';
        }
	    ipcRenderer.send(type, msg);	
    }

    
    ensureSize();
    
}
catch(e) {   } // sure...

// make sure we update the size.
setTimeout(ensureSize, 500);
