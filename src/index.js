process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('module-alias/register');

const express = require('express');
const app = express();
const port = 5434;
const { sleep } = require('@src/utils/sleep');
const config = require('@root/config.json');
const devices = require('@root/devices.json');
const NVXDirector = require('@src/structures/NVXDirector');
const NVXDevice = require('@src/structures/NVXDevice');

const director = new NVXDirector(config.NVX_DIRECTOR_IP, config.NVX_DIRECTOR_USERNAME, config.NVX_DIRECTOR_PASSWORD);
director.connect();


app.get('/connect', async (req, res) => {
  director.connect();
  res.sendStatus(200);
});


app.get('/domains', async (req, res) => {
  director.getDomains();
  res.sendStatus(200);
});

app.post('/domain/routing/mac/:srcMAC/:dstMAC', async (req, res) => {
  director.route(req.params.srcMAC, req.params.dstMAC);
  res.sendStatus(200);
});

app.post('/setup/gameday', async (req, res) => {
  // TX: Spare1 -> RX: Cave PGM 1
  director.route(devices.TX.Spare1[0], devices.RX.CavePGM1[0]);
  // TX: Rack PC 1 -> RX: Cave PGM 2
  director.route(devices.TX.RackPC1[0], devices.RX.CavePGM2[0]);
  // TX: Loose 1 -> RX: Cave PGM 3
  director.route(devices.TX.Loose1[0], devices.RX.CavePGM3[0]);
  // TX: Loose 2 -> RX: Cave PGM 4
  director.route(devices.TX.Loose2[0], devices.RX.CavePGM4[0]);
  // TX: Spare1 -> RX: Booth Table
  director.route(devices.TX.Spare1[0], devices.RX.BoothTable[0]);
  // TX: Streaming PC -> RX: Booth Wall
  director.route(devices.TX.StreamingPC[0], devices.RX.BoothWall[0]);
  // TX: Rack PC 1 -> RX: Confidence L
  director.route(devices.TX.RackPC1[0], devices.RX.ConfidenceL[0]);
  // TX: Rack PC 2 -> RX: Confidence R
  director.route(devices.TX.RackPC2[0], devices.RX.ConfidenceR[0]);
  // Power on Booth Wall
  powerDeviceByName('BoothWall', 'on');
  // Power on Booth Table
  powerDeviceByName('BoothTable', 'on');
  // Power on Confidence L
  powerDeviceByName('ConfidenceL', 'on');
  // Power on Confidence R
  powerDeviceByName('ConfidenceR', 'on');

  res.sendStatus(200);
})
app.post('/setup/cave', async (req, res) => {
  // TX: Brightsign -> RX: Cave PGM 1
  director.route(devices.TX.Brightsign[0], devices.RX.CavePGM1[0]);
  // TX: Brightsign -> RX: Cave PGM 2
  director.route(devices.TX.Brightsign[0], devices.RX.CavePGM2[0]);
  // TX: Brightsign -> RX: Cave PGM 3
  director.route(devices.TX.Brightsign[0], devices.RX.CavePGM3[0]);
  // TX: Brightsign -> RX: Cave PGM 4
  director.route(devices.TX.Brightsign[0], devices.RX.CavePGM4[0]);
  // TX: Streaming PC -> RX: Booth Table
  director.route(devices.TX.StreamingPC[0], devices.RX.BoothTable[0]);
  // TX: Streaming PC -> RX: Booth Wall
  director.route(devices.TX.StreamingPC[0], devices.RX.BoothWall[0]);
  // TX: Confidence L Feed -> RX: Confidence L
  director.route(devices.TX.ConfidenceLFeed[0], devices.RX.ConfidenceL[0]);
  // TX: Confidence L Feed -> RX: Confidence R
  director.route(devices.TX.ConfidenceRFeed[0], devices.RX.ConfidenceR[0]);
  // Power off Booth Wall
  powerDeviceByName('BoothWall', 'off');
  // Power off Booth Table
  powerDeviceByName('BoothTable', 'off');
  // Power off Confidence L
  powerDeviceByName('ConfidenceL', 'off');
  // Power off Confidence R
  powerDeviceByName('ConfidenceR', 'off');

  res.sendStatus(200);
})

app.post('/device/:deviceName/:state', async (req, res) => {
  powerDeviceByName(req.params.deviceName, req.params.state);
  res.sendStatus(200);
})


// Function to provide power commands
async function powerDeviceByName(deviceName, state){
  const device = new NVXDevice(devices.RX[deviceName][1], config.NVX_DIRECTOR_USERNAME, config.NVX_DIRECTOR_PASSWORD);
  await device.connect();
  sleep(1000).then(() => state == "on" ? device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOn":{"Test":true}}}}}}}}') : device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOff":{"Test":true}}}}}}}}'));
}


// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Kill after 10 seconds if started from Stream Deck Companion
if (process.argv[2] == 'streamdeck') {
  sleep(10000).then(() => {
    process.exit();
  });
}