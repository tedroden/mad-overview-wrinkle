
var app = angular.module('MarkdownViewerApp', ['ngMaterial']);

const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

function showOpenDialog() {
	ipcRenderer.send('asynchronous-message', 'show-open-dialog');	
}

ipcRenderer.on('asynchronous-reply', function(event, arg) {
	console.log(arg); // prints "pong"
});

