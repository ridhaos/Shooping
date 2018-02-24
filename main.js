const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");

var indexRow;

const { app, BrowserWindow, Menu, ipcMain } = electron;
let deleteUpdate;
let mainWindow;
let dashWindow;
let addProduit;
const dataBase = fs.readFileSync('./db.json');
const dataBaseParse = JSON.parse(dataBase);
const User = dataBaseParse.User;
const StockDB = fs.readFileSync('./StockDB.json');
const Stock = JSON.parse(StockDB);

// Listen for app to be ready
app.on('ready', function () {
    // Create new window
    mainWindow = new BrowserWindow({})
    // Load HTML file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
})

ipcMain.on('login', function (e, username, password) {
    var userExist = false
    for (var i = 0; i < User.length; i++) {
        if (User[i].username == username) {
            if (User[i].password == password) {
                userExist = true;
            }
        }
    }
    if (userExist) {
        // Create new window
        dashWindow = new BrowserWindow({
            width: 992,
            height: 700,
            title: 'Tableau de bord'
        })
        // Load HTML file into window
        dashWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/dashboard.html'),
            protocol: 'file:',
            slashes: true
        }));
        mainWindow.close();
        // Add new Menu
        mainMenuTemplate.push({ label: 'Dashboard', submenu: [{ label: 'Facture',click(){ goToFacture(); } },{label : 'Stock',click(){ goToStock(); }}] });
        // Build new Menu from template
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        // Insert new Menu
        Menu.setApplicationMenu(mainMenu);
    }
})


function createProduit(){
    addProduit=new BrowserWindow({
        width:400,
        height:550,
        title: "Ajout Produit"

    })
    addProduit.loadURL(url.format({
        pathname: path.join(__dirname, 'views/ajoutProduit.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function goToEditStock(index){
    deleteUpdate=new BrowserWindow({
        width:890,
        height:550,
        title: "Edit Stock"

    })
    deleteUpdate.loadURL(url.format({
        pathname: path.join(__dirname, 'views/deleteUpdate.html'),
        protocol: 'file:',
        slashes: true
    }));

    
}



function goToFacture(){
    dashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/facture.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function goToStock(){
    
    dashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/stock.html'),
        protocol: 'file:',
        slashes: true
    }));
   
  
   
}

function goToDashboard(){
    dashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/dashboard.html'),
        protocol: 'file:',
        slashes: true
    }));
}

ipcMain.on('item:add',function(e, item){
   
    Stock.push({
        Reference : item[0],
        NomProduit : item[1],
        PrixAchat : item[2],
        NbrStock : item[3],
        PrixCatA : item[4],
        PrixCatB : item[5],
        PrixCatC : item[6],
    })
    fs.writeFileSync('./StockDB.json', JSON.stringify(Stock), 'utf8');
    dashWindow.webContents.send('item:add', item);
    addProduit.close();
});

ipcMain.on('factureOpenEvent', function(e, item){
    goToFacture();

});

ipcMain.on('delete:update', function(e, index){
    console.log('row :'+index);
    goToEditStock(index);
    indexRow=index-1;
    

});

ipcMain.on('ajoutProduit', function(){
    createProduit();
});



ipcMain.on('stockOpenEvent', function(e, item){
    goToStock();
});

ipcMain.on('dashboardOpenEvent', function(e, item){
    goToDashboard()
})

ipcMain.on('load:ready', function(e, yes){
    deleteUpdate.webContents.send('index', indexRow);
});

ipcMain.on('edit:complete', function(){
 deleteUpdate.close();
    dashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/stock.html'),
        protocol: 'file:',
        slashes: true
    }));
});
//mainWindow.webContents.send('item:add', item);

const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]

// If MAC, add empty object to Menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// add developer tools item if not in prod
if (process.env.NODE_ENC !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}