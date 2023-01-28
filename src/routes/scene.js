const Router = require('express-promise-router');
const router = new Router();

const SceneController = require('@src/controllers/scene');

router.post('/setup/:file', SceneController.recall);

module.exports = router;