const { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, globalShortcut, shell } = require('electron');
const path = require('path');
const url = require('url');
const Analytics = require('electron-google-analytics');

const AppUpdater = require('./modules/AppUpdater');
const ManualUpdater = require('./modules/ManualUpdater');

class App {
	constructor() {
		this.analytics = new Analytics.default('UA-131558223-1');
		this.rpc = require('discord-rich-presence')('528735337015410712');
		this.updater = new AppUpdater('info');

		this.startTimestamp = new Date();
		this.rpcData = {
			startTimestamp: this.startTimestamp,
			instance: true,
			details: 'Using MyRPC',
			state: 'Being totally awesome',
			largeImageText: 'MyRPC',
			smallImageText: 'Made by RailRunner16',
			largeImageKey: 'large_default',
			smallImageKey: 'small_default'
		}
		
		this.tray = null;
		this.mainWindow = null;
		this.icon = nativeImage.createFromPath(path.join(__dirname, 'assets/logo_square_512.png'));

		this.initAppEvents();
		this.initIpcEvents();

		this.buildMenu();
	}

	createWindow() {
		this.mainWindow = new BrowserWindow({
			width: 1200,
			height: 1000,
			resizable: true,
			titleBarStyle: 'hidden',
		});
	
		this.mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'public/index.html'),
			protocol: 'file:',
			slashes: true,
		}));

		if (process.platform != 'darwin') {
			this.mainWindow.setIcon(this.icon);
		}
	
		this.mainWindow.on('close', event => {
			event.preventDefault();
			this.mainWindow.hide();
		});
	}

	initIpcEvents() {
		ipcMain.on('asynchronous-message', (e, data) => {
			this.rpcData.details = data.details;
			this.rpcData.state = data.state;
			this.rpcData.largeImageText = data.largeImageText;
			this.rpcData.smallImageText = data.smallImageText;
			this.rpcData.largeImageKey = data.largeImageKey;
			this.rpcData.smallImageKey = data.smallImageKey;
		
			//the fuck is this? debug mode isn't on!
			//console.debug(rpcData);
		
			this.setActivity(this.rpcData);
		})
		
		ipcMain.on('synchronous-message', (e, action) => {
			switch (action.toLowerCase()) {
				case 'get_time':
					e.returnValue = this.startTimestamp;
			}
		});
	}

	initAppEvents() {
		app.on('ready', () => {
			this.buildTray();
			this.createWindow();
			app.setName('MyRPC');
		
			globalShortcut.register('CommandOrControl+Shift+I', () => {
				this.mainWindow.webContents.openDevTools();
			});
		
			this.updater.check();
		
			this.setActivity(this.rpcData);
		});

		app.on('window-all-closed', () => {
			app.quit();
		});
		
		app.on('activate', () => {
			if (this.mainWindow === null) {
				this.createWindow();
			}
		});
	}

	setActivity(data) {
		if (!this.rpc || !this.mainWindow) {
			return;
		}
	
		return this.rpc.updatePresence(data);
	}

	buildMenu() {
		const windowMenu = Menu.buildFromTemplate([
			{
				label: 'Links',
				submenu: [
					{
						label: 'Support Server',
						click() {
							shell.openExternal('https://discord.gg/xna9NRh');
						},
						icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/discord.png')).resize({ width: 18, height: 18, quality: 'best' })
					},
					
					{
						label: 'Source Code',
						click() {
							shell.openExternal('https://github.com/RailRunner166/MyRPC');
						},
						icon: nativeImage.createFromPath(path.join(__dirname, 'assets/Github-Logo-Black.png')).resize({width: 18, height: 18, quality: 'best'})
					},
					{
						label: 'Website',
						click() {
							shell.openExternal('http://myrpc.railrunner16.me/');
						},
						icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/globe.png')).resize({ width: 18, height: 18, quality: 'best' })
					}
				]
			},
			{
				label: 'Actions',
				submenu: [
					{
						label: 'Exit MyRPC',
						click() { 
							app.exit()
						},
						icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/close.png')).resize({width: 18, height: 18, quality: 'best'})
					},
					{
						label: 'Check for Updates',
						click: ManualUpdater.checkForUpdates,
						icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/download.png')).resize({width: 18, height: 18, quality: 'best'})
					}
				]
			}
		]);
	
		Menu.setApplicationMenu(windowMenu);
	}

	buildTray() {
		this.tray = new Tray(this.icon);

		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Support Server',
				click() {
					shell.openExternal('https://discord.gg/xna9NRh');
				},
				icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/discord.png')).resize({ width: 18, height: 18, quality: 'best' })
			},
			
			{
				label: 'Source Code',
				click() {
					shell.openExternal('https://github.com/RailRunner166/MyRPC');
				},
				icon: nativeImage.createFromPath(path.join(__dirname, 'assets/Github-Logo-Black.png')).resize({width: 18, height: 18, quality: 'best'})
			},
			{
				label: 'Website',
				click() {
					shell.openExternal('http://myrpc.railrunner16.me/');
				},
				icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/globe.png')).resize({ width: 18, height: 18, quality: 'best' })

			},
			{
				label: 'Exit MyRPC',
				click() { 
					app.exit()
				},
				icon: nativeImage.createFromPath(path.join(__dirname, 'assets/menu_icons/close.png')).resize({width: 18, height: 18, quality: 'best'})
			}
		]);

		this.tray.setToolTip('MyRPC');

		this.tray.setContextMenu(contextMenu);

		this.tray.on('click', () => {
			this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show();
		});
	}
}

new App();
