const { Client, GatewayIntentBits, Collection } = require('discord.js');
const http = require('http');
const config = require('./config');
const { registerEvents } = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

registerEvents(client);

client.login(config.token);

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', bot: client.user?.tag || 'starting...' }));
}).listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
