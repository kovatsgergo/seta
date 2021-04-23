var players = [];
//var urls = ['IGNAC_TRACK1.mp3', 'IGNAC_TRACK2.mp3', 'IGNAC_TRACK3.mp3', 'IGNAC_TRACK4.mp3']
var urls = ['IDOVONAL_TRACK1.m4a', 'IDOVONAL_TRACK2.m4a', 'IDOVONAL_TRACK3.m4a', 'IDOVONAL_TRACK4.m4a']
//var urls = ['IGNAC_TRACK1SR.m4a', 'IGNAC_TRACK2SR.m4a', 'IGNAC_TRACK3SR.m4a', 'IGNAC_TRACK4SR.m4a']
//var urls = ['test1.mp3', 'test2.mp3', 'test3.mp3', 'test4.mp3']

window.onload = loadAllFiles();

function loadAllFiles() {
    for (let i = 0; i < urls.length; i++) {
        localforage.getItem('f' + i).then(blob => {
            if (!blob) {
                fetch(urls[i])
                    .then(res => res.blob())
                    .then(blob => {
                        localforage.setItem('f' + i, blob)
                    })
                    .then(_ => {
                        loaded.innerHTML += ' '+i + '–newly_stored'; //document.getElementById('loaded')
                        setBoxColor(i);
                    });
            } else {
                loaded.innerHTML += ' '+i + '–already_stored';
                setBoxColor(i);
            }
        });
    }
}

document.getElementById('clearCookies').addEventListener('click', function () {
    console.log('deletefiles');
    for (let i = 0; i < urls.length; i++) {
        localforage.removeItem('f' + i).then(function () {
            // Run this code once the key has been removed.
            console.log('Key is cleared!');
        }).catch(function (err) {
            // This code runs if there were any errors
            console.log(err);
        });
    }
    localforage.clear();
})

function setBoxColor(ind, ended) {
    document.getElementById('bl' + ind).style.backgroundColor = ended ? 'orange' : 'green';
}

function preparePlayer(ind) {
    state.index = ind;
    return localforage.getItem('f' + ind).then(blob => {
        console.log(blob);
        if (blob) {
            console.log('bloooob', URL.createObjectURL(blob));
            /// THIS FIRES TIMEUPDATE (currentTime = 0)
            myAudio.setAttribute('src', URL.createObjectURL(blob));
            //myAudio.load();
            console.log('ind ' + ind);
            myAudio.index = ind;
        }
        return 1;
    });
}

function returnPromise() {
    return new Promise(function (resolve, reject) {
        resolve('start of new Promise');
    });
}

function playIt(func, ind, prom) {
    //console.log('playIt', func, ind);
    if (myAudio.index == ind) {
        return doPlay(func);
    } else {
        return preparePlayer(ind).then(_ => {
            return doPlay(func);
        });
    }
}

function doPlay(func) {
    if (func === 'start') {
        console.log('START');
        //console.log('startstate', state);
        //console.log('startcurrtime', myAudio.currentTime);
        //myAudio.currentTime = state.time;
        //console.log('startcurrtime 2', myAudio.currentTime);
        return myAudio.play();
    }

    if (func === 'stop') {
        console.log('STOP');
        myAudio.pause();
        return returnPromise();
    }
}