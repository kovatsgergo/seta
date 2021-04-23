function iOS() {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}


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
            'group': state.group
        }
    }
    ws.send(JSON.stringify(message));
    unique.innerHTML += id;
}

function updateColoredDivs() {
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

window.addEventListener('offline', function(event){
    console.log("You lost connection.");
});
window.addEventListener('online', function(event){
    console.log("You are now back online.");
    prepareWebSocket(state.group);
});

//////////////////// LOCK SCREEN CONTROL DISABLE
if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler('play', function () {
        /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler('pause', function () {
        /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler('stop', function () {
        /* Code excerpted. */
    });
}

function onLoadOrCanplay(){
    console.log('onloadedmetadata', stateForLoad, state, myAudio.currentTime, myAudio.duration);
    state = {
        ...stateForLoad
    };
    myAudio.currentTime = state.time;
    bar.style.width = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) + "%";
    console.log('after onloaded', stateForLoad, state, myAudio.currentTime, myAudio.duration);
    updateTimeText();
    updateColoredDivs();
    nowplaying.innerHTML = '' + state.index + ' ' + state.playing;
}

if(iOS()){
    myAudio.addEventListener('canplay', onLoadOrCanplay);
}
myAudio.addEventListener('loadedmetadata', onLoadOrCanplay);

var allevents = ['canplay', 'canplaythrough', 'loadeddata', 'loadedmetadata', 'seeking', 'seeked', 'timeupdate'];

/*allevents.forEach(ev => {
    myAudio.addEventListener(ev, function () {
        console.log(ev);
    })
});*/
/*myAudio.onloadedmetadata = function () {
    console.log('onloadedmetadata', stateForLoad, state, myAudio.currentTime, myAudio.duration);
    state = {
        ...stateForLoad
    };
    myAudio.currentTime = state.time;
    bar.style.width = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) + "%";
    console.log('after onloaded', stateForLoad, state, myAudio.currentTime, myAudio.duration);
    updateTimeText();
    updateColoredDivs();
    nowplaying.innerHTML = '' + state.index + ' ' + state.playing;
    console.log('after onloaded', stateForLoad, state, myAudio.currentTime, myAudio.duration);
};*/