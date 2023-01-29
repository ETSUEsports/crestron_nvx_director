function connect(req, res) {
    req.app.director.connect();
    res.sendStatus(200);
}
function getDomains(req, res) {
    req.app.director.getDomains().then((result) => {
        res.json(result);
    });
}
function setRoutingByMAC(req, res) {
    req.app.director.routeByMAC(req.params.srcMAC, req.params.dstMAC).then((result) => {
        res.json(result);
    });
}
function setRoutingByName(req, res) {
    req.app.director.routeByName(req.params.src, req.params.dst).then((result) => {
        res.json(result);
    });
}

module.exports = { connect, getDomains, setRoutingByMAC, setRoutingByName }