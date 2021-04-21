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
            'id': id
        }
    }
    ws.send(JSON.stringify(message));
    unique.innerHTML += id;
}

////////////////////////////////////////// SOUND
myAudio.addEventListener("ended", function () {
    state.playing = false;
    state.ended = myAudio.index;
    successLoad(myAudio.index, true);
});


//////////////////// LOCATION
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

getLocation();