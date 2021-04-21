////////////////////////////////////////// DOESN'T ALLOW APP TO SLEEP?
var noSleep = new NoSleep();

////////////////////////////////////////// KEEP WS CONNECTION UP
var timerID = 0;

function keepAlive() {
    var timeout = 20000;
    if (ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify({}));
    }
    timerId = setTimeout(keepAlive, timeout);
}

function cancelKeepAlive() {
    if (timerId) {
        clearTimeout(timerId);
    }
}

////////////////////////////////////////// NET
function handShake(id) {
    message = {
        'new': {
            'type': role,
            'id': id,
            'group': group
        }
    }
    ws.send(JSON.stringify(message));
    unique.innerHTML += id;
}

////////////////////////////////////////// SOUND
myAudio.addEventListener("ended", function () {
    state.playing = false;
    //state.ended = myAudio.index;
    successLoad(myAudio.index, true);
});

function setBLs() {
    for (let i = 0; i < 4; i++) {
        temp = ''
        if (state.index == i) {
            temp += 'solid 5px' +
                (state.playing ? ' black' : ' gray');
        } else {
            temp = 'solid 5px var(--bgcolor)';
        }
        document.getElementById('bl' + i).style.border = temp;
    }
}

//////////////////// LOCATION
/*function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

getLocation();*/