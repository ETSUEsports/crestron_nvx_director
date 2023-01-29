const Router = require('express-promise-router');
const router = new Router();

const NVXDirectorController = require('@src/controllers/nvx_director');

router.post('/director/connect', NVXDirectorController.connect);
router.get('/director/domains', NVXDirectorController.getDomains);
router.put('/director/domain/routing/mac/:srcMAC/:dstMAC', NVXDirectorController.setRoutingByMAC);
router.put('/director/domain/routing/name/:src/:dst', NVXDirectorController.setRoutingByName);

module.exports = router;