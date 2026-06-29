const { REST, Routes } = require('discord.js');
const fs = require('fs');

async function registerCommands(client) {
  const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
  const commands = [];

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(client.token);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });
    console.log('[COMMANDS] Registered all slash commands');
  } catch (err) {
    console.error('[COMMANDS] Failed to register:', err);
  }
}

module.exports = { registerCommands };
