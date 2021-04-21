'use strict';
var nezos = [];
var control;

const express = require('express');
const {
    Server
} = require('ws');

const PORT = process.env.PORT || 3000;
//const INDEX = '/index.html';

const server = express()
    .use('/', express.static(__dirname + '/'))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({
    server
});

var state = {
    'index': -1,
    'time': -1,
    'playing': false
}

wss.on('connection', (ws, req) => {
    //const ip = req.socket.remoteAddress;
    //console.log('connected ws', ws);
    //console.log('connected req', req);

    ws.on('close', () => {
        removeClientFromAll(ws);
    });

    ws.on('message', function (data) {
        console.log('message', data);
        var obj = JSON.parse(data);
        if (obj.new) {
            storeNewClient(ws, obj.new);
            ws.send(JSON.stringify(state));
        }
        if (obj.time !== undefined) {
            state = obj;
            nezos.forEach(nezo => {
                nezo.ws.send(JSON.stringify(obj));
            });
        }
    });
});

class Client {
    constructor(ws, id, group) {
        this.ws = ws;
        this.id = id;
        this.group = group;
    }
    setCoords(coords) {
        this.coords = coords;
    }
    equals(client) {
        return this.id == client.id;
    }
}

function storeNewClient(ws, obj) {
    ///////kiszedni
    if (typeof obj.id != 'undefined') {
        var id = obj.id;
        if (obj.type == 'client') {
            storeClient(ws, id, obj.group, nezos);
        } else {
            storeClient(ws, id, obj.group);
        }
        sendClients();
    }
}

function sendClients() {
    console.log('send: ', nezos.length, nezos.map(x => x.id), control);
    if (control != null) {
        control.ws.send(JSON.stringify({
            'clients': nezos.length,
            'ids': nezos.map(x => x.id)
        }))
    }
}

function storeClient(ws, id, group, list) {
    if (typeof list !== 'undefined') {
        let found = false;
        list.forEach(member => {
            if (member.id == id) {
                found = true;
                if (member.ws != ws) {
                    member.ws = ws;
                }
            }
        });
        if (!found) {
            list.push(new Client(ws, id, group));
        }
    } else {
        if (control != null && control.id != id) {
            ws.send(JSON.stringify({
                'server': 'already'
            }));
        } else {
            control = new Client(ws, id, group);
            sendClients();
        }
    }
}

function removeClientFromAll(ws) {
    removeClient(ws);
    removeClient(ws, nezos);
    if (nezos.length == 0 && control == null) {
        state = {
            'index': -1,
            'time': -1,
            'playing': false
        }
    }
}

function removeClient(ws, list) {
    if (typeof list !== 'undefined') {
        list.forEach(el => {
            if (el.ws == ws) {
                list.splice(list.indexOf(el), 1);
            }
        });
    } else if (control != null && control.ws == ws) {
        control = null;
    }
    sendClients();
}

/*var timerID = 0;

function keepAlive() {
    var timeout = 5000;
    if (ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify({}));
    }
    timerId = setTimeout(keepAlive, timeout);
}*/