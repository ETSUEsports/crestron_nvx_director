const NVXDevice = require('@src/structures/NVXDevice');
const devices = require('@root/devices.json');
const config = require('@root/config.json');
const { sleep } = require('@src/utils/sleep');

async function powerDeviceByName(deviceName, state) {
    const device = new NVXDevice(devices.RX[deviceName][1], config.NVX_DIRECTOR_USERNAME, config.NVX_DIRECTOR_PASSWORD);
    await device.connect();
    sleep(1000).then(() => state == "on" ? device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOn":{"Test":true}}}}}}}}') : device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOff":{"Test":true}}}}}}}}'));
}
async function powerDeviceByIP(deviceName, state) {
    const device = new NVXDevice(devices.RX[deviceName][1], config.NVX_DIRECTOR_USERNAME, config.NVX_DIRECTOR_PASSWORD);
    await device.connect();
    sleep(1000).then(() => state == "on" ? device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOn":{"Test":true}}}}}}}}') : device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOff":{"Test":true}}}}}}}}'));
}

module.exports = { powerDeviceByName, powerDeviceByIP };