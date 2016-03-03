
var app = angular.module('MarkdownViewerApp', ['ngMaterial']);

const ipcRenderer = require('electron').ipcRenderer;

function sendMessage(msg) {
    console.log("SENDING MESSAGE: " + msg);
	ipcRenderer.send('asynchronous-message', msg);	
}

ipcRenderer.on('asynchronous-reply', function(event, arg) {
	// console.log(arg); // we don't have anything to do here.
});

