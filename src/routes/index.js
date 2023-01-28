const nvx_device = require('./nvx_device');
const nvx_director = require('./nvx_director');

module.exports = app => {
	app.use(nvx_device);
	app.use(nvx_director);
	app.get('*', function(req, res) {
		res.status(404);
		return res.json(apiResponse({
			error: true,
			message: 'Error 404 Route not found',
		}));
	});
};