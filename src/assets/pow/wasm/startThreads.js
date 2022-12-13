

const pow_initiate = function(threads, worker_path) {
  if (typeof worker_path == 'undefined') {
    worker_path = '';
  }
  if (isNaN(threads)) {
    threads = self.navigator.hardwareConcurrency - 1;
  }
  const workers = [];
  for (let i = 0; i < threads; i++) {
    workers[i] = new Worker(worker_path + 'thread.js');
  }
  return workers;
};

const pow_start = function(workers, hash) {
  if ((hash instanceof Uint8Array) && (hash.length == 32)) {
    const threads = workers.length;
    console.log('posting messages...');
    for (let i = 0; i < threads; i++) {
      workers[i].postMessage(hash);
    }
  }
};

const pow_terminate = function(workers) {
  const threads = workers.length;
  for (let i = 0; i < threads; i++) {
    workers[i].terminate();
  }
};

const pow_callback = (workers, hash, ready, callback) => {
    console.log('hash = ' + hash);
  if ( (hash.length == 64) && (typeof callback == 'function')) {
    const threads = workers.length;
    console.log(threads);
    for (let i = 0; i < threads; i++) {
      workers[i].onmessage = function(e) {
        result = e.data;
        console.log(result);
        if (result == 'ready') {
				    workers[i].postMessage(hash);
				    ready();
        } else if (result !== false && result != '0000000000000000') {
            console.log('doing the callback now');
            console.log(result);
          pow_terminate(workers);
          callback(result);
        } else workers[i].postMessage(hash);
      };
    }
  }
};

let workers = [];
workers = pow_initiate(undefined, 'assets/pow/wasm/');

window.startWasm = async (hash, successFn) => {
    console.log(workers);
    pow_callback(workers, hash, () => {}, successFn);
    console.log('callback done');
    pow_start(workers, hash);
    console.log('start done');
};

window.stopWasm = async () => {
    pow_terminate(workers);
};
