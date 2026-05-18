const https = require('https');

const options = {
  host: 'ac-lyphrmb-shard-00-00.nkkntfg.mongodb.net',
  port: 27017,
  servername: 'ac-lyphrmb-shard-00-00.nkkntfg.mongodb.net',
  rejectUnauthorized: false,
  timeout: 10000,
};

const req = https.request(options, (res) => {
  console.log('Connected! TLS version:', res.socket.getProtocol());
  process.exit(0);
});

req.on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Connection timed out');
  req.destroy();
  process.exit(1);
});

req.end();
