const NVXDirector = require('@src/structures/NVXDirector');
const config = require('@root/config.json');

const director = new NVXDirector(config.NVX_DIRECTOR_IP, config.NVX_DIRECTOR_USERNAME, config.NVX_DIRECTOR_PASSWORD);
director.connect();

function connect(req, res) {
    director.connect();
    res.sendStatus(200);
}
function getDomains(req, res) {
    director.getDomains().then((result) => {
        res.json(result);
    });
}
function setRouting(req, res) {
    director.route(req.params.srcMAC, req.params.dstMAC);
    res.sendStatus(200);
}

module.exports = { connect, getDomains, setRouting }