function getId(func) {
    var uniq
    try {
        localforage.getItem('unique').then(blob => {
            if (!blob) {
                uniq = Date.now();
                localforage.setItem('unique', uniq);
                console.log('notexisted', uniq);
            } else {
                uniq = blob;
                console.log('existed ', blob, uniq);
            }
        }).then(_ => {
            console.log('after ' + uniq);
            func(uniq);
            return uniq;
        });
    } catch (err) {
        console.log(err);
    }
}