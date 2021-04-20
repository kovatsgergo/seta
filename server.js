'use strict';
var nezos = [];
var controls = [];

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

        /*if (nezos.includes(ws)) {
            nezos.splice(nezos.indexOf(ws), 1);
        } else if (controls.includes(ws)) {
            controls.splice(nezos.indexOf(ws), 1);
        }*/
    });

    ws.on('message', function (data) {
        console.log('message', data);
        if (data === 'client new') { //////////// NEW CLIENT = NEZO
            //nezos.push(new Client(ws));
            storeClient(ws, nezos);
            console.log('at ' + new Date().toLocaleTimeString() +
                ' New CLIENT added, now total: ' + nezos.length);
        } else if (data === 'control new') {
            //controls.push(new Client(ws));
            storeClient(ws, controls);
            console.log('at ' + new Date().toLocaleTimeString() +
                ' New CONTROL added, now total: ' + controls.length);
        } else {
            var obj = JSON.parse(data);
            if (obj.new) {
                storeNewClient(ws, obj.new);
                ws.send(JSON.stringify(state));
            }
            if (obj.latitude) {
                updateNezos(ws, obj);
            } else if (obj.control || obj.timeupdate) { ///// FORWARD TO NEZOS
                console.log(obj);
                nezos.forEach(nezo => {
                    nezo.ws.send(JSON.stringify(obj));
                });
            } else if (obj.time) {
                state = obj;
            }
            //console.log('message', obj);
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
            storeClient(ws, id, controls);
        }
        controls.forEach(control => {
            control.ws.send(JSON.stringify({
                'clients': nezos.length
            }))
        });

    }
}

function storeClient(ws, id, group) {
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
}

function removeClientFromAll(ws) {
    removeClient(ws, controls);
    removeClient(ws, nezos);
}

function removeClient(ws, group) {
    group.forEach(el => {
        if (el.ws == ws) {
            group.splice(group.indexOf(el), 1);
            console.log(group);
        }
    });
}