const { powerDeviceByName } = require('@src/utils/power');

function powerState(req, res) {
    powerDeviceByName(req.params.deviceName, req.params.state);
    res.sendStatus(200);
}

module.exports = { powerState };