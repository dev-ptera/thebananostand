self.importScripts('pow.js');

const ready = false;

Module['onRuntimeInitialized'] = function() {
  postMessage('ready');
};

onmessage = function(ev) {
  const PoW = Module.cwrap('launchPoW', 'string', ['string']);
  const hash = ev.data;
  // let generate = Module.ccall("launchPoW", 'string', ['string'], hash);
  const generate = PoW(hash);

  if (generate != '0000000000000000') {
	    // console.log(generate +" found");
    postMessage(generate); // Worker return
  } else {
	    postMessage(false);
  }
};
