const nvx_device = require('./nvx_device');
const nvx_director = require('./nvx_director');
const scene = require('./scene');

module.exports = app => {
	app.use(nvx_device);
	app.use(nvx_director);
	app.use(scene);
	app.get('*', function(req, res) {
		res.status(404);
		return res.json({
			error: true,
			errorMessage: 'Error 404 Route not found',
		});
	});
};