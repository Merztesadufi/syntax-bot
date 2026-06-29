const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
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
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const player = new Player(client);
(async () => {
  await player.extractors.loadMulti(DefaultExtractors);
})().catch(e => console.error('[PLAYER] Failed to load extractors:', e));
client.player = player;

registerEvents(client);

client.login(config.token).catch(e => console.error('[LOGIN] Failed:', e));

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED]', err);
});

client.on('error', (err) => {
  console.error('[CLIENT ERROR]', err);
});

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', bot: client.user?.tag || 'starting...' }));
}).listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
