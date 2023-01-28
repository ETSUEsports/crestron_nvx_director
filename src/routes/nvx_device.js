const Router = require('express-promise-router');
const router = new Router();

const NVXDeviceController = require('@src/controllers/nvx_device');

router.post('/device/:deviceName/:state', NVXDeviceController.powerState);

module.exports = router;