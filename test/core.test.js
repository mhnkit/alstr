// Runs the data-layer tests in plain Node: `npm test`
const fs = require('fs'), path = require('path');
const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
globalThis.navigator = { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120' };
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const core = src('core.js').replace(/\nif \(typeof module[^\n]*\n?/, '\n');
eval(core + '\n' + src('seed.js') + '\n' + fs.readFileSync(path.join(__dirname, 'core.cases.js'), 'utf8') + '\nif (failN) process.exitCode = 1;');
