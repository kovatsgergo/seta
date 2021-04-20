var id, target, options, crd;

function distance(a, b) {
    return Math.sqrt(
        Math.pow(a.latitude - b.latitude, 2) +
        Math.pow(a.longitude - b.longitude, 2)
    );
}

function success(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;

    coords = position.coords;
    if(role=='client'){
        setCoords(position.coords);
    }
    //marker.setLatLng([position.coords.latitude, position.coords.longitude]);

    watcher.innerHTML = '';
    closeTo.innerHTML = '';
    targets.forEach(target => {
        dist = distance(position.coords, target);
        //console.log(dist);
        watcher.innerHTML += '<br>' + target.text + ' távolság: ' + dist;
        if (dist < 0.0002) {
            closeTo.innerHTML = 'Most a ' + target.text + ' közelében vagy';
            //navigator.geolocation.clearWatch(id);
            switch (target.type) {
                case 'auto':
                    playIt(target.music, target.func);
                    break;
                case 'button':
                    //createFullButton(target);
                    break;
            }
        }
    });
}

function error(err) {
    watcher.innerHTML = 'ERROR(' + err.code + '): ' + err.message;
}

////////////////////////////////////////////////
targetSzobor = {
    latitude: 47.51273854926056,
    longitude: 19.04896060374858,
    text: '1-es track: Columbo-szobor',
    music: '0',
    func: 'start',
    type: 'button'
}

target2Vili = {
    latitude: 47.50578457500719,
    longitude: 19.0471017290587,
    text: '2-es track: 2-es villamos, Kossuth tér',
    music: '1',
    func: 'start',
    type: 'button'
}

target2Mix = {
    latitude: 47.4899404858925,
    longitude: 19.066606348458773,
    text: '3-as track: Mikszáth tér, szökőkút',
    music: '2',
    func: 'start',
    type: 'button'
}

target2Zebra = {
    latitude: 47.495989164866224,
    longitude: 19.065995678794334,
    text: '4-es track: Rákóczi 28, zebra',
    music: '3',
    func: 'start',
    type: 'button'
}

var targets = [targetSzobor, target2Vili, target2Mix, target2Zebra];

options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

id = navigator.geolocation.watchPosition(success, error, options);