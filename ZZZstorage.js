f.onchange = store;

function store() {
  if (this.files[0].type.indexOf('audio/') !== 0) {
    log.textContent = 'Not an audio file...'
    return;
  }
  localforage.setItem('myfile', f.files[0]).then(_ => {
    log.textContent = 'page will soon reload, and load this audio file from storage';
    setTimeout(_ => location.reload(), 3000);
  })
}

function getFile() {
  var blob = localforage.getItem('myfile').then(blob => {
    if (!blob) {
      log.textContent = 'Please choose an audio file to be stored.'
      return;
    }
    clear_btn.disabled = false;
    log.textContent = 'playing stored file: ' + blob.name;
    const aud = new Audio(URL.createObjectURL(blob));
    aud.onloadedmetadata = e => URL.revokeObjectURL(aud.src);
    aud.play();
  }).catch(e => console.log(e));
}
getFile();

clear_btn.onclick = e => {
	localforage.removeItem('myfile');
}