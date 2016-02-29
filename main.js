'use strict';

// electron requires
const electron = require('electron');
const dialog = require('electron').dialog;
const menu = require('electron').menu;
const ipc = require('electron').ipcMain;

// for our app
const marked = require('marked');
const fs = require('fs');
const md5 = require('md5');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const WIDTH = 800;
const HEIGHT = 600;
const APP_TITLE = "Markdown Viewer";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windowList = [];

const HEADER = "<html><head>" +
	  "<link rel='stylesheet' href='" + __dirname + "/styles/app.css'> \n" +
	  "<link rel='stylesheet' href='" + __dirname + "/styles/github-markdown.css'> \n" +
	  "<link rel='stylesheet' href='" + __dirname + "/styles/highlight/github.css'> \n" +
	  "<script type='text/javascript' src='" + __dirname + "'some.js'></script>\n" +
	  "<script type='text/javascript' src='" + __dirname + "'menu.js'></script>\n" +	  
	  "</head><body><div class='markdown-body'> ";
const FOOTER = "</div></body></html>";

var markdown_file = null;
var last_md5 = null;

var OUTPUT_DIR = "/tmp/";
var OPEN_FILES = {};

var LANG_MAP = {
	"shell": "bash",
	"zsh": "zsh"
};

// Synchronous highlighting with highlight.js
marked.setOptions({
	highlight: function (code, lang) {
		if(lang) {
			try {
				if(lang in LANG_MAP) { lang = LANG_MAP[lang]; }
				return require('highlight.js').highlight(lang, code).value;
			}
			catch (e) {}
		}
		// if we don't know the language...
		return require('highlight.js').highlightAuto(code).value;
	}
});


var renderer = new marked.Renderer();
renderer.listitem = function(text) {
	var data = /^\[(.)\]/.exec(text);
	if(data) {
		var checked = data[1] == ' ' ? '' : 'checked';
		text = "<input " + checked + " type='checkbox' /> " + text.substring(3);
	}	
	return "<li>" + text + "</li>";
};

ipc.on('asynchronous-message', function(event, arg) {

	if(arg == 'show-open-dialog') {
		dialog.showOpenDialog(event.sender.getOwnerBrowserWindow(),
							  { properties: [ 'openFile' ]},
							  function(data) {
								  if(data && data.length) {
									  monitor(data[0], event.sender.getOwnerBrowserWindow());
								  }
							  });
	}
	else if(arg == 'new-window') {
		createWindow();
	}
	
	console.log(arg);  // prints "ping"
});


function getOutputDir() {
	return OUTPUT_DIR;
}
function md5_for_file(fn) {
	if(fn in OPEN_FILES) {
		return OPEN_FILES[fn].md5;
	}
}
function monitor(fn, window) {

	// fixme: we can probably just check the last updated time
	fs.readFile(fn, 'utf8', function (err,data) {

		if (err) { return console.log(err); }

		var file = {
			"input": fn,
			"output": getOutputDir() + md5(data) + ".html",
			"md5": null,
		};
		
		// check that the file has changed
		var _md5 = md5(data);
		// if it it hasn't been updated, return
		if(_md5 == md5_for_file(file.input)) { return; }
		file.md5 = _md5;
		OPEN_FILES[file.input] = file;

		// write the file.
		var html = HEADER + marked(data, { renderer: renderer }) + FOOTER;
		fs.writeFile(file.output, html);

		// load it.
		window.loadURL("file://" + file.output);
		
		console.log("Reloaded: " + file.output);
	});
	setTimeout(function() { monitor(fn, window); }, 1000);
}

function doThing() {
	console.log("Doing thing");
}

function createWindow () {
	
	// Create the browser window.
	var window = new BrowserWindow({width: WIDTH, height: HEIGHT, title: APP_TITLE});
	window.onbeforeunload = function(e) { console.log("ON BEFORE!"); }

	if(process.argv.length != 3) {
		var intro_url =  'file://' + __dirname + '/intro.html';
		window.loadURL(intro_url);
	}
	else {
		markdown_file = process.argv[2];
		monitor(markdown_file, window);		
	}
	

	// Emitted when the window is closed.
	window.on('closed', function(data) {
		window.removeAllListeners();
		var windowID = windowList.indexOf(window);

		// remove the window from the window list
		if(windowID !== -1) {
			windowList.splice(windowID, 1);
		}
		else {
			console.log("Could not find the window!");
		}
		window = null;
	});
	windowList.push(window);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
	createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if(windowList.length == 0) {
		createWindow();
	}
});
