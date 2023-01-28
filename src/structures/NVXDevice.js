const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const querystring = require('node:querystring');
const axios = require('axios');
const ws = require('ws');

class NVXDevice {
  constructor(ip, username, password) {
    this.ip = ip;
    this.username = username;
    this.password = password;
    this.device;
  }
  async connect() {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    await client.get(`https://${this.ip}/userlogin.html`);
    await client.post(`https://${this.ip}/userlogin.html`, querystring.stringify({
      login: this.username,
      passwd: this.password
    }));
    const device = new ws(`wss://${this.ip}/websockify`, {
      headers: {
        'Cookie': jar.getCookieStringSync(`https://${this.ip}`)
      }
    })
    this.device = device;
/*
    this.device.addEventListener('message', (event) => {
      const reply = JSON.parse(event.data);
      if (reply.Device.AudioVideoInputOutput.Outputs && reply.Device.AudioVideoInputOutput.Outputs.length > 0) {

        switch (reply.Device.AudioVideoInputOutput.Outputs[0].Ports[0].IsSinkConnected) {
          case true:
            console.log("TV Powered On");
            break;
          case false:
            console.log("TV Powered Off");
            break;
          default:
            console.log("IsSinkConnected property not found");
        }
      }
      else {
        console.log("Outputs property not found or empty")
      }
    });
*/
    return device;
  }
  async send(command) {
    this.device.send(command);
  }
  async powerOn() {
    this.device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOn":{"Test":true}}}}}}}}');
  }
  async powerOff() {
    this.device.send('{"Device":{"CustomControlPortCommands":{"Cec":{"PortList":{"Port1":{"CommandList":{"PowerOff":{"Test":true}}}}}}}}');
  }
}

module.exports = NVXDevice;