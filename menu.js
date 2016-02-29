
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

var menuTemplate = [
	{
		label: 'Application',
		submenu: [
			{
				label: 'About',
				role: 'about'
			},
			{
				label: 'Quit',
				accelerator: 'CmdOrCtrl+Q',
				role: 'quit'
			},				
		]
	},	
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
			},
			{
				label: 'Toggle Dev Tools',
				accelerator: 'CmdOrCtrl+I',
				click: function(item, win) {
					win.toggleDevTools();
				}
			},							
			{
				label: 'Close Window',
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
			]
	},
];

var menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
