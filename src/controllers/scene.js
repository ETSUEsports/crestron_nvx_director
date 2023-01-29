const { powerDeviceByName } = require('@src/utils/power');
const devices = require('@root/devices.json');

function recall(req, res) {
    const scene = require(`@root/scenes/${req.params.file}.json`);
    console.log(`Setting up scene ${scene.name} - ${scene.description}`);

    scene.routing.forEach(route => {
        console.log(`Routing TX:${route.tx} to RX:${route.rx}`);
        req.app.director.routeByMAC(devices.TX[route.tx][0], devices.RX[route.rx][0]);
    });
    scene.power.forEach(display => {
        console.log(`Powering ${display.state} display:${display.rx}`);
        powerDeviceByName(display.rx, display.state);
    });
    res.sendStatus(200);
}

module.exports = { recall };