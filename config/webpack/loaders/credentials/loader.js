const crypto = require('crypto');
const fs = require('fs');
const YAML = require('yaml');
const { spawn } = require('child_process');

const ALGORITHM = 'aes-128-gcm';

let credentialsPromise = null;

async function loadCredentials() {
  // TODO: read a different one based on RAILS_ENV, if it exists
  let encryptedCredentials = await fs.promises.readFile('config/credentials.yml.enc');
  // TODO: check environment variable, and also different env
  let key = await fs.promises.readFile('config/master.key');
  key = Buffer.from(key.toString('ascii'), 'hex');

  let [encryptedData, iv, authTag] = encryptedCredentials.toString().split('--').map(v => Buffer.from(v, 'base64'));

  if (!authTag || authTag.length !== 16) throw new Error('InvalidMessage');

  let cipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  cipher.setAuthTag(authTag);
  cipher.setAAD(Buffer.alloc(0));
  cipher.setAutoPadding(false);

  let decryptedData = cipher.update(encryptedData);
  decryptedData = Buffer.concat([decryptedData, cipher.final()])

  let message = await marshalLoad(decryptedData);

  return YAML.parse(message);
}

function returnOrLoadCredentials() {
  if (!credentialsPromise) {
    credentialsPromise = loadCredentials();
  }
  return credentialsPromise;
}

function marshalLoad(data) {
  return new Promise((resolve, reject) => {
    let child = spawn('/usr/bin/env', ['ruby', '-e', 'puts Marshal.load(ARGF.read)'], { stdio: ['pipe', 'pipe', process.stderr] });
  
    let dataBuffers = []
    child.stdout.on('data', function (data) {
      dataBuffers.push(data)
    });
  
    child.on('close', function (code, signal) {
      if (code === 0) {
        let message = Buffer.concat(dataBuffers).toString();
  
        resolve(message)
      } else if (signal !== null) {
        reject(new Error('Marshal load killed with signal ' + signal));
      } else {
        reject(new Error('Marshal load failed with code ' + code));
      }
    })

    child.on('error', reject);
  
    child.stdin.write(data);
    child.stdin.end();
  })
}

async function loader(source) {
  let callback = this.async();

  try {
    let credentials = await returnOrLoadCredentials();

    let newSource = source.replace(/\$\$RailsCredentials(\.[a-zA-Z_]+)+/g, match => {
      let path = match.split('.');
      let obj = credentials;
      for (let i = 1; i < path.length; i++) {
        obj = obj[path[i]];
      }
      return JSON.stringify(obj);
    });

    callback(null, newSource);
  } catch (error) {
    callback(error);
  }
}

module.exports = loader;
