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

const pow_callback = function(workers, hash, ready, callback) {
  if ( (hash.length == 64) && (typeof callback == 'function')) {
    const threads = workers.length;
    for (let i = 0; i < threads; i++) {
      workers[i].onmessage = function(e) {
        result = e.data;
        if (result == 'ready') {
				    workers[i].postMessage(hash);
				    ready();
        } else if (result !== false && result != '0000000000000000') {
          pow_terminate(workers);
          callback(result);
        } else workers[i].postMessage(hash);
      };
    }
  }
};
