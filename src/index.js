process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ws = require('ws');
const axios = require('axios');
const express = require('express');
const app = express();
const port = 5434;
const { base64encode, base64decode } = require('./utils/base64');
const config = require('../config.json');
const devices = require('../devices.json');
const socket = new ws('wss://172.16.5.216/');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const querystring = require('node:querystring');

socket.onopen = async () => {
  // Login to NVX Director and get Token
  const loginResult = await axios.post(`https://${config.NVX_DIRECTOR_IP}/signin`, {
    username: base64encode(config.NVX_DIRECTOR_USERNAME),
    password: base64encode(config.NVX_DIRECTOR_PASSWORD)
  });
  const token = loginResult.data.token;
  // Connect to NVX Director WebSocket
  socket.send(base64encode(`{"Command":"WSLogin","username":"${base64encode(config.NVX_DIRECTOR_USERNAME)}","token":"${token}"}`));
}

socket.addEventListener('message', (event) => {
  console.log(`Message from server:`);
  const reply = JSON.parse(base64decode(event.data));
  /*
  if(reply.Domains){
    console.log(reply.Domains[0].Transmitters);
    console.log(reply.Domains[0].Recievers);
  }
  */
  console.log(reply);
});

app.get('/connect', async (req, res) => {

  // Login to NVX Director and get Token
  const loginResult = await axios.post(`https://${config.NVX_DIRECTOR_IP}/signin`, {
    username: base64encode(config.NVX_DIRECTOR_USERNAME),
    password: base64encode(config.NVX_DIRECTOR_PASSWORD)
  });
  const token = loginResult.data.token;
  // Connect to NVX Director WebSocket
  socket.send(base64encode(`{"Command":"WSLogin","username":"${base64encode(config.NVX_DIRECTOR_USERNAME)}","token":"${token}"}`));

  res.sendStatus(200);
});


app.get('/domains', async (req, res) => {
  socket.send(base64encode(`{"Command":"GetDomains"}`));
  res.sendStatus(200);
});

app.post('/domain/routing/:srcMAC/:dstMAC', async (req, res) => {
  socket.send(base64encode(`{"Command":"SetRoute","DomainID":0,"TX":"${req.params.srcMAC}","RX":"${req.params.dstMAC}","SetRoute":"1"}`))
  res.sendStatus(200);
});

app.post('/setup/gameday', async (req, res) => {
  // TX: Spare1 -> RX: Cave PGM 1
  route(devices.TX.Spare1[0], devices.RX.CavePGM1[0]);
  // TX: Rack PC 1 -> RX: Cave PGM 2
  route(devices.TX.RackPC1[0], devices.RX.CavePGM2[0]);
  // TX: Loose 1 -> RX: Cave PGM 3
  route(devices.TX.Loose1[0], devices.RX.CavePGM3[0]);
  // TX: Loose 2 -> RX: Cave PGM 4
  route(devices.TX.Loose2[0], devices.RX.CavePGM4[0]);
  // TX: Spare1 -> RX: Booth Table
  route(devices.TX.Spare1[0], devices.RX.BoothTable[0]);
  // TX: Streaming PC -> RX: Booth Wall
  route(devices.TX.StreamingPC[0], devices.RX.BoothWall[0]);
  // TX: Rack PC 1 -> RX: Confidence L
  route(devices.TX.RackPC1[0], devices.RX.ConfidenceL[0]);
  // TX: Rack PC 2 -> RX: Confidence R
  route(devices.TX.RackPC2[0], devices.RX.ConfidenceR[0]);
  // Power on Booth Wall
  powerDevice('BoothWall', 'on');
  // Power on Booth Table
  powerDevice('BoothTable', 'on');
  // Power on Confidence L
  powerDevice('ConfidenceL', 'on');
  // Power on Confidence R
  powerDevice('ConfidenceR', 'on');

  res.sendStatus(200);
})
app.post('/setup/cave', async (req, res) => {
  // TX: Brightsign -> RX: Cave PGM 1
  route(devices.TX.Brightsign[0], devices.RX.CavePGM1[0]);
  // TX: Brightsign -> RX: Cave PGM 2
  route(devices.TX.Brightsign[0], devices.RX.CavePGM2[0]);
  // TX: Brightsign -> RX: Cave PGM 3
  route(devices.TX.Brightsign[0], devices.RX.CavePGM3[0]);
  // TX: Brightsign -> RX: Cave PGM 4
  route(devices.TX.Brightsign[0], devices.RX.CavePGM4[0]);
  // TX: Streaming PC -> RX: Booth Table
  route(devices.TX.StreamingPC[0], devices.RX.BoothTable[0]);
  // TX: Streaming PC -> RX: Booth Wall
  route(devices.TX.StreamingPC[0], devices.RX.BoothWall[0]);
  // TX: Confidence L Feed -> RX: Confidence L
  route(devices.TX.ConfidenceLFeed[0], devices.RX.ConfidenceL[0]);
  // TX: Confidence L Feed -> RX: Confidence R
  route(devices.TX.ConfidenceRFeed[0], devices.RX.ConfidenceR[0]);
  // Power off Booth Wall
  powerDevice('BoothWall', 'off');
  // Power off Booth Table
  powerDevice('BoothTable', 'off');
  // Power off Confidence L
  powerDevice('ConfidenceL', 'off');
  // Power off Confidence R
  powerDevice('ConfidenceR', 'off');

  res.sendStatus(200);
})

app.post('/device/:deviceName/:state', async (req, res) => {
  powerDevice(req.params.deviceName, req.params.state)
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});




async function connectToDevice(name) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  const IP = devices.RX[name][1];
  await client.get(`https://${IP}/userlogin.html`);
  await client.post(`https://${IP}/userlogin.html`, querystring.stringify({
    login: config.NVX_DIRECTOR_USERNAME,
    passwd: config.NVX_DIRECTOR_PASSWORD
  }));

  const device = new ws(`wss://${IP}/websockify`, {
    headers: {
      'Cookie': jar.getCookieStringSync(`https://${IP}`)
    }
  })

  return device;
}

function route(tx, rx) {
  socket.send(base64encode(`{"Command":"SetRoute","DomainID":0,"TX":"${tx}","RX":"${rx}","SetRoute":"1"}`));
}
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function powerDevice(deviceName, state) {
  const device = await connectToDevice(deviceName);
  sleep(1000).then(() => state == "on" ? device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOn":{"Test":true}}}}}}}}') : device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOff":{"Test":true}}}}}}}}'));
}

if (process.argv[2] == 'streamdeck') {

  sleep(10000).then(() => {
    process.exit();
  });
}