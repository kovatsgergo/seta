//const { Tone } = require("./Tone");

var players = [];
var urls = ['IGNAC_TRACK1.mp3', 'IGNAC_TRACK2.mp3', 'IGNAC_TRACK3.mp3', 'IGNAC_TRACK4.mp3']

for (let i = 0; i < urls.length; i++) {
    localforage.getItem('f' + i).then(blob => {
        if (!blob) {
            fetch(urls[i])
                .then(res => res.blob())
                .then(blob => {
                    localforage.setItem('f' + i, blob)
                })
                .then(_ => {
                    loaded.innerHTML += '<br> ' + urls[i] + ' is successfully stored'; //document.getElementById('loaded')
                });
        } else {
            loaded.innerHTML += '<br> ' + urls[i] + ' is already stored';
        }
    });
}

var player

function preparePlayer(ind) {
    localforage.getItem('f' + ind).then(blob => {
        console.log(blob);
        if (blob) {
            console.log('bloooob', URL.createObjectURL(blob));
            player = new Tone.Player(
                URL.createObjectURL(blob),
            ).toDestination();
            player.onstop = function () {
                console.log('ON STOP ' + ind);
                player.dispose();
            }
        }
    });
}

function playIt(ind, func) {
    console.log('playIt ind', ind);
    if (!player || player._wasDisposed) {
        localforage.getItem('f' + ind).then(blob => {
            console.log(blob);
            if (blob) {
                console.log('bloooob', URL.createObjectURL(blob));
                player = new Tone.Player(
                    URL.createObjectURL(blob),
                    () => {
                        doPlay(player, func);
                    }
                ).toDestination();
                player.onstop = function () {
                    console.log('ON STOP ' + ind);
                    player.dispose();
                }
            }
        });
    } else {
        doPlay(player, func);
    }

}

function doPlay(player, func) {
    if (func === 'start') {
        if (player.state != 'started') {
            console.log('START');
            player.start();
        }
    }
    if (func === 'loop') {
        if (player.state != 'started') {
            console.log('START LOOPED');
            player.loop = true;
            player.start();
        }
    }
    if (func === 'stop') {
        if (player.state == 'started') {
            console.log('STOP');
            player.stop();
            player.dispose();
        }
    }
}




function readBack() {
    var blob = localforage.getItem('myfile').then(blob => {
        if (!blob) {
            log.textContent = 'Please choose an audio file to be stored.'
            return;
        }
        //clear_btn.disabled = false;
        console.log('playing stored file: ' + blob.name);
        const aud = new Audio(URL.createObjectURL(blob));
        aud.onloadedmetadata = e => URL.revokeObjectURL(aud.src);
        aud.play();
    }).catch(e => console.log(e));
}


function blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
    });
}

function arrayBufferToBlob(buffer, type) {
    return new Blob([buffer], {
        type: type
    });
}