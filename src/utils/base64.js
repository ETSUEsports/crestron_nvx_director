function base64encode(string) {
    return Buffer.from(string).toString('base64');
}
function base64decode(base64) {
    return Buffer.from(base64, 'base64').toString('ascii');
}

module.exports = { base64encode, base64decode };