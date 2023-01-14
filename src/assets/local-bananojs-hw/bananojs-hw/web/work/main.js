let finished = true;
let restart = true;

let workers;
let wasmStartMs;
// const threshold = '0xFFFFFFF8';
// const threshold = '0xFFFFFFF0';
const threshold = '0xFFFFFE00';

const finishedFlags = {
  wasm: true,
  webgl: true,
  js: true,
};

const counts = {
  wasm: 0,
  webgl: 0,
  js: 0,
};

const totals = {
  wasm: 0,
  webgl: 0,
  js: 0,
};

window.onLoad = async () => {
  // newRandomPrevious();
};

window.newRandomPrevious = async () => {
  const previousBytes = new Uint8Array(32);
  window.crypto.getRandomValues(previousBytes);
  const previous = window.bananocoinBananojs.bananoUtil.bytesToHex(previousBytes);
  document.getElementById('previous').value = previous;
};

window.randomPreviousAndStartNewRace = async () => {
  if (restart) {
    await delay(1000);
    await newRandomPrevious();
    await startNewRace();
  }
};

window.startNewRace = async () => {
  restart = true;
  const keys = [...Object.keys(finishedFlags)];
  for (const key of keys) {
    finishedFlags[key] = false;
    document.getElementById(`${key}Work`).value = '';
  }
  finished = false;
  workers = pow_initiate(undefined, 'wasm/');
  startWebGL();
  startWasm();
  startJS();
  synchStats();
};

window.stopRaceNoRestart = () => {
  restart = false;
  stopRace();
};

window.stopRace = () => {
  finished = true;
  stopWasm();
};

window.synchStats = async () => {
  let html = '';
  const add = (type) => {
    html += `<strong>${type}</strong>`;
    html += ` Count: ${counts[type]}`;
    html += ` Total Ms: ${totals[type]}`;
    html += ` Finished: ${finishedFlags[type]}`;
    html += '<br>';
  };
  const keys = [...Object.keys(counts)];
  for (const key of keys) {
    add(key);
  }
  let allFinished = true;
  for (const key of keys) {
    if (!finishedFlags[key]) {
      allFinished = false;
    }
  }
  html += `<strong>Finishing</strong>`;
  html += ` All Finished: ${allFinished}`;
  document.getElementById('stats').innerHTML = html;
};

window.callback = (workValue, ms, type) => {
  finishedFlags[type] = true;

  console.log('callback', workValue, ms, type);
  let isWorkValidFlag = null;
  if (workValue !== null) {
    const hash = document.getElementById('previous').value;
    const hashBytes = window.bananocoinBananojs.bananoUtil.hexToBytes(hash);
    const workBytes = window.bananocoinBananojs.bananoUtil.hexToBytes(workValue);
    isWorkValidFlag = window.bananocoinBananojs.bananoUtil.isWorkValid(hashBytes, workBytes.reverse());
    if (isWorkValidFlag) {
      totals[type] += ms;
      counts[type] ++;
    }
  }
  document.getElementById(`${type}Work`).value =
   `${workValue} in ${ms} ms. work is valid: ${isWorkValidFlag}`;
  synchStats();

  const keys = [...Object.keys(finishedFlags)];
  let allFinished = true;
  for (const key of keys) {
    if (!finishedFlags[key]) {
      allFinished = false;
    }
  }
  if (allFinished) {
    randomPreviousAndStartNewRace();
  }
};

window.startWebGL = async () => {
  const startMs = Date.now();
  const hash = document.getElementById('previous').value;
  nanoWebglPow(hash,
      (workValue, n) => {
        stopRace();
        const ms = Date.now() - startMs;
        callback(workValue, ms, 'webgl');
      },
      (n) => {
        if (finished) {
          const ms = Date.now() - startMs;
          callback(null, ms, 'webgl');
          return true;
        }

        document.getElementById('webglWork').value = 'Calculated ' + n + ' frames...';
      },
      threshold,
  );
};

window.stopWasm = async () => {
  pow_terminate(workers);
  const ms = Date.now() - wasmStartMs;
  callback(null, ms, 'wasm');
};

const delay = (time) => {
  if (!isNaN(time)) {
    if (isFinite(time)) {
      return new Promise((resolve) => {
        const fn = () => {
          resolve();
        };
        setTimeout(fn, time);
      });
    }
  }
};

window.startWasm = async () => {
  wasmStartMs = Date.now();
  const hash = document.getElementById('previous').value;
  pow_callback(workers, hash, () => {}, (workValue) => {
    stopRace();
    const ms = Date.now() - wasmStartMs;
    callback(workValue, ms, 'wasm');
  });
};

window.startJS = async () => {
  const startMs = Date.now();
  const hash = document.getElementById('previous').value;
  const workBytes= new Uint8Array(8);
  const hashBytes = window.bananocoinBananojs.bananoUtil.hexToBytes(hash);


  let isWorkValidFlag = window.bananocoinBananojs.bananoUtil.isWorkValid(hashBytes, workBytes);
  let n = 1;
  while (!isWorkValidFlag) {
    n++;
    document.getElementById('jsWork').value = 'Calculated ' + n + ' frames...';
    await delay(1);
    if (finished) {
      const ms = Date.now() - startMs;
      callback(null, ms, 'js');
      return;
    }
    window.bananocoinBananojs.bananoUtil.incrementBytes(workBytes);
    isWorkValidFlag = window.bananocoinBananojs.bananoUtil.isWorkValid(hashBytes, workBytes);
  }
  const workValue = window.bananocoinBananojs.bananoUtil.bytesToHex(workBytes.reverse());
  stopRace();
  const ms = Date.now() - startMs;
  callback(workValue, ms, 'js');
};
