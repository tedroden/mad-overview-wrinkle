'use strict';

// electron requires
const electron = require('electron');
const dialog = require('electron').dialog;
const menu = require('electron').menu;
const ipc = require('electron').ipcMain;
const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const shell = require('electron').shell;

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

var HEADER = "<html><head>" +
	"<script src=\"http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js\"></script>" +
    "<link rel='stylesheet' href='" + __dirname + "/styles/app.css'> \n" +
	"<link rel='stylesheet' href='" + __dirname + "/styles/github-markdown.css'> \n" +
	"<link rel='stylesheet' href='" + __dirname + "/styles/highlight/github.css'> \n" +
	"<script type='text/javascript' src='" + __dirname + "/some.js'></script>\n" +
	"</head><body><div class='markdown-body'> ";

var FOOTER = "</div></body></html>";

var markdown_file = null;
var last_md5 = null;

// var OUTPUT_DIR = "./";
var OPEN_FILES = {};

var LANG_MAP = {
	"shell": "bash",
	"zsh": "zsh"
};

var FILE_START = ".mow-";

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
    else if (arg == 'window-close') {
        event.sender.getOwnerBrowserWindow().close();
    }
	
	console.log(arg);  // prints "ping"
});

ipc.on('open-url', function(event, arg) {
    shell.openExternal(arg);
});

function getHeader(bodyClass) {
    return HEADER;
}

function getOutputDir(fn) {
    // FIXME: will "/" work on windows?
    return path.resolve(path.dirname(fn)) + "/";
}

function md5_for_file(fn) {
    if(fn in OPEN_FILES) {
	    return OPEN_FILES[fn].md5;
    }
    return null;
}

function monitor(fn, window) {
  
	// fixme: we can probably just check the last updated time
	fs.readFile(fn, 'utf8', function (err,data) {
        
		if (err) { return console.log(err);}


		var file = {
			"input": fn,
			"output": getOutputDir(fn) + FILE_START + md5(fn) + ".html",
			"md5": null
		};

		// check that the file has changed
		var _md5 = md5(data);
		if(_md5 == md5_for_file(file.input)) { return null; }
		file.md5 = _md5;
		OPEN_FILES[file.input] = file;

		// write the file.
		var html = getHeader('markdown-body') + marked(data, { renderer: renderer }) + FOOTER;
		fs.writeFile(file.output, html);

		// // load it.
        // console.log(window.webContents);
	    window.webContents.send('load-url', "file://" + file.output);
        window.loadedURL = file.output;
        return null;
	});
	setTimeout(function() { monitor(fn, window); }, 1000);
}

function doThing() {
	console.log("Doing thing");
}

function createWindow () {
	
	// Create the browser window.
	var window = new BrowserWindow({width: WIDTH, height: HEIGHT, title: APP_TITLE, frame: false});
	window.onbeforeunload = function(e) { console.log("ON BEFORE!"); }

    // load the main frame...
	var intro_url =  'file://' + __dirname + '/mainframe.html';
	window.loadURL(intro_url);

	if(process.argv.length == 3) {
		markdown_file = process.argv[2];
		monitor(markdown_file, window);		
	}

    // window.toggleDevTools();
    window.on('resize', function(data) {
	    window.webContents.send('resize', 'now');
    });

    window.on('close', function(data) {
        // delete the file
        var p = window.loadedURL;
        if(path.basename(p).indexOf(FILE_START) === 0) {
            console.log("Cleaning up: " + path.basename(p));
            fs.unlink(p);
        }
        else{
            console.log("Didn't clean up: " + p);
        }
    });

	// Emitted when the window is closed.
	window.on('closed', function(data) {
		window.removeAllListeners();
		// remove the window from the window list
		var windowID = windowList.indexOf(window);
		if(windowID !== -1) {
			windowList.splice(windowID, 1);
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
	//if (process.platform !== 'darwin') {
		app.quit();
	//}
});

app.on('activate', function () {
	if(windowList.length == 0) {
		createWindow();
	}
});
