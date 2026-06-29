const fs = require('fs');
const path = require('path');

function registerEvents(client) {
  const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
  console.log('[EVENTS] Registered all event handlers');
}

module.exports = { registerEvents };
