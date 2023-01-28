const axios = require('axios');
const config = require('../../config.json');

async function getToken(username, password){
    const loginResult = await axios.post(`https://${config.NVX_DIRECTOR_IP}/signin`,{
        username: base64encode(username),
        password: base64encode(password)
    });
    return loginResult.data.token;
}

module.exports = { getToken };