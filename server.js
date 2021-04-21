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
        if (obj.latitude) {
            updateNezos(ws, obj);
        } else if (obj.time !== undefined) {
            state = obj;
            nezos.forEach(nezo => {
                nezo.ws.send(JSON.stringify(obj));
            });
        }
    });
});

class Client {
    constructor(ws, id) {
        this.ws = ws;
        this.id = id;
    }
    setCoords(coords) {
        this.coords = coords;
    }
    equals(client) {
        return this.id == client.id;
    }
}

function updateNezos(ws, coords) {
    nezos.forEach(nezo => {
        if (nezo.ws == ws) {
            nezo.setCoords(coords);
        }
    })
}

function storeNewClient(ws, obj) {
    ///////kiszedni
    if (typeof obj.id != 'undefined') {
        var id = obj.id;
        if (obj.type == 'client') {
            storeClient(ws, id, nezos);
        } else {
            storeClient(ws, id);
        }
        //controls.forEach(control => {
        control.ws.send(JSON.stringify({
            'clients': nezos.length
        }))
        //});
    }
}

function storeClient(ws, id, group) {
    if (group) {
        let found = false;
        group.forEach(member => {
            if (member.id == id) {
                found = true;
                if (member.ws != ws) {
                    member.ws = ws;
                }
            }
        });
        if (!found) {
            group.push(new Client(ws, id));
        }
        console.log(group);
    } else {
        if (control != null) {
            ws.send(JSON.stringify({
                'server': 'already'
            }));
        } else {
            control = new Client(ws, id);
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

function removeClient(ws, group) {
    if (group)
        group.forEach(el => {
            if (el.ws == ws) {
                group.splice(group.indexOf(el), 1);
                console.log(group);
            }
        });
    else {
        control = null;
    }
}