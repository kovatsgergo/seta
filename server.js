'use strict';

const NR_OF_GROUPS = 3;

var state = {
    'index': 0,
    'time': 0,
    'playing': false,
    'group': -1
}

var nezos = [];
var controls = [];
var states = [];

for (let i = 0; i < NR_OF_GROUPS; i++) {
    nezos.push([]);
    controls.push(undefined);
    states.push({
        ...state
    });
    states[i].group = i;
}

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

//only primitives inside, so shallow copy is ok
//https://www.javascripttutorial.net/object/3-ways-to-copy-objects-in-javascript/

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
            var groupIndex = obj.new.group;
            //if (states[groupIndex].controlLeftAt != undefined) {
                //states[groupIndex].time += (Date.now() - states[groupIndex].controlLeftAt) / 1000;
                //states[groupIndex].controlLeftAt = undefined;
            //}
            console.log(states[groupIndex]);
            ws.send(JSON.stringify(states[groupIndex]));
        } else if (obj.time !== undefined) {
            states[obj.group] = obj;
            nezos[obj.group].forEach(nezo => {
                nezo.ws.send(JSON.stringify(obj));
            });
        } else if (obj.ended) {
            states[obj.ended.group].playing = false;
        } else if(obj.controlMessage) {
            var stt = obj.state;
            states[stt.group] = stt;
            nezos[stt.group].forEach(nezo => {
                nezo.ws.send(JSON.stringify(stt));
            });
            controls[stt.group].ws.send(JSON.stringify(stt));
        }else if(obj.endedMessage){
            var stt = obj.state;
            states[stt.group] = stt;
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
        sendClientsToControl(obj.group);
    }
}

function sendClientsToControl(group) {
    console.log('group: ' + group + 'nezos len: ',
        nezos[group].length, 'nezos ids: ',
        nezos[group].map(x => x.id));
    if (controls[group] != undefined) {
        controls[group].ws.send(JSON.stringify({
            'clients': nezos[group].length,
            'ids': nezos[group].map(x => x.id)
        }))
    }
}

function storeClient(ws, id, groupIndex, list) {
    ////////////////////////// client is a NEZO
    if (typeof list !== 'undefined') {
        let found = false;
        list.forEach(groupList => {
            groupList.forEach(member => {
                if (member.id == id) {
                    found = true;
                    if (member.ws != ws) {
                        member.ws = ws;
                    }
                }
            });
        });

        if (!found) {
            list[groupIndex].push(new Client(ws, id, groupIndex));
        }
    } else { ////////////////// client is a CONTROL
        if (controls[groupIndex] != undefined && controls[groupIndex].id != id) {
            ws.send(JSON.stringify({
                'server': 'already'
            }));
        } else {
            controls[groupIndex] = new Client(ws, id, groupIndex);
            sendClientsToControl(groupIndex);
        }
    }
    /*console.log('AFTER STORE');
    console.log('nezos', nezos);
    console.log('controls', controls);
    console.log('______________________________');*/
}

function removeClientFromAll(ws) {
    var groupIndex = removeClient(ws);
    if (groupIndex > -1) {
        if (controls[groupIndex] == undefined) {
            if (nezos[groupIndex].length == 0) {
                //////////////////// reset group state if everyone has left
                states[groupIndex] = {
                    ...state
                }
                states[groupIndex].group = groupIndex;
            } else if (states[groupIndex].playing == true) {
                //////////////////// set time when control left its group
                //states[groupIndex].controlLeftAt = Date.now();
            }
        }
    }
    /*console.log('AFTER REMOVE');
    console.log('nezos', nezos);
    console.log('controls', controls);
    console.log('______________________________');*/
}

function removeClient(ws) {
    var group = -1;
    for (let i = 0; i < nezos.length; i++) {
        nezos[i].forEach(el => {
            if (el.ws == ws) {
                nezos[i].splice(nezos[i].indexOf(el), 1);
                group = i;
            }
        });
    }
    if (group == -1) {
        for (let i = 0; i < controls.length; i++) {
            if (controls[i] != undefined && controls[i].ws == ws) {
                controls[i] = undefined;
                group = i;
            }

        }
    }
    if (group > -1) {
        sendClientsToControl(group);
    }
    return group;
}

/*var timerID = 0;

function keepAlive() {
    var timeout = 5000;
    if (ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify({}));
    }
    timerId = setTimeout(keepAlive, timeout);
}*/