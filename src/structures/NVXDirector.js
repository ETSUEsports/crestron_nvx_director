const axios = require('axios');
const ws = require('ws');
const { base64encode, base64decode } = require('@src/utils/base64');

class NVXDirector {
    constructor(ip, username, password) {
        this.ip = ip;
        this.username = username;
        this.password = password;
        this.token;
        this.socket;
    }
    async connect() {
        const socket = new ws(`wss://${this.ip}/`);
        this.socket = socket;
        this.socket.onopen = async () => {
            // Login to NVX Director and get Token
            const loginResult = await axios.post(`https://${this.ip}/signin`, {
                username: base64encode(this.username),
                password: base64encode(this.password)
            });
            this.token = loginResult.data.token;
            // Connect to NVX Director WebSocket
            socket.send(base64encode(`{"Command":"WSLogin","username":"${base64encode(this.username)}","token":"${this.token}"}`));
        }
        this.socket.addEventListener('message', (event) => {
            console.log(`Message from server:`);
            const reply = JSON.parse(base64decode(event.data));
            /*
            if(reply.Domains){
              console.log(reply.Domains[0].Transmitters);
              console.log(reply.Domains[0].Recievers);
            }
            */
            console.log(reply);
        });
        return socket;
    }
    async send(command) {
        this.socket.send(command);
    }
    async route(tx, rx) {
        this.socket.send(base64encode(`{"Command":"SetRoute","DomainID":0,"TX":"${tx}","RX":"${rx}","SetRoute":"1"}`));
    }
    async getDomains() {
        this.socket.send(base64encode(`{"Command":"GetDomains"}`));
    }
}

module.exports = NVXDirector;