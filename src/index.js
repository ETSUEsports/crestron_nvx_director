process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('module-alias/register');

const express = require('express');
const app = express();
const port = 5434;
const routes = require('./routes');
const { sleep } = require('@src/utils/sleep');
const config = require('@root/config.json');
const NVXDirector = require('@src/structures/NVXDirector');

const director = new NVXDirector(config.NVX_DIRECTOR_IP, config.NVX_DIRECTOR_USERNAME, config.NVX_DIRECTOR_PASSWORD);
director.connect();

// Mount routes
routes(app);

// Give the app instance the director object
app.director = director;

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Kill after 10 seconds if started from Stream Deck Companion
if (process.argv[2] == 'streamdeck') {
  sleep(10000).then(() => {
    process.exit();
  });
}