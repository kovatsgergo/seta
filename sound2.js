var players = [];
var urls = ['IGNAC_TRACK1.mp3', 'IGNAC_TRACK2.mp3', 'IGNAC_TRACK3.mp3', 'IGNAC_TRACK4.mp3']
//var urls = ['test1.mp3', 'test2.mp3', 'test3.mp3', 'test4.mp3']

for (let i = 0; i < urls.length; i++) {
    localforage.getItem('f' + i).then(blob => {
        if (!blob) {
            fetch(urls[i])
                .then(res => res.blob())
                .then(blob => {
                    localforage.setItem('f' + i, blob)
                })
                .then(_ => {
                    //loaded.innerHTML += '<br>' + urls[i] + ' is successfully stored'; //document.getElementById('loaded')
                    successLoad(i);
                });
        } else {
            //loaded.innerHTML += '<br>' + urls[i] + ' is already stored';
            successLoad(i);
        }
    });
}

function successLoad(ind, ended) {
    document.getElementById('bl' + ind).style.backgroundColor = ended ? 'orange' : 'green';
}

function preparePlayer(ind) {
    state.index = ind;
    return localforage.getItem('f' + ind).then(blob => {
        console.log(blob);
        if (blob) {
            console.log('bloooob', URL.createObjectURL(blob));
            myAudio.setAttribute('src', URL.createObjectURL(blob));
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
    console.log('playIt', func, ind);
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
        return myAudio.play();        
    }

    if (func === 'stop') {
        console.log('STOP');
        myAudio.pause();
        return returnPromise();
    }
}