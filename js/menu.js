
// var Menu = require('menu');
// var MenuItem = require('menu-item');
const remote = require('electron').remote;  
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

var menuTemplate = [
	{
		label: 'Application',
		submenu: [
			{
				label: 'Quit',
				accelerator: 'CmdOrCtrl+Q',
				role: 'quit'
			}
		]
	}
/*
	{
		label: 'File',
		submenu: [
			{
				label: 'New Window',
				accelerator: 'CmdOrCtrl+N',
				click: function(item, focusedWindow) {
					console.log("clicked");
					try {
						ipcRenderer.send('asynchronous-message', 'new-window');
					}
					catch(e) {
						console.log("failed on new");
						console.log(e);
					}
				}
			}
		]
	}
*/
];

var menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
