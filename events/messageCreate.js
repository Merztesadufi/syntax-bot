const { addXP } = require('../utils/leveling');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const level = await addXP(message.author.id, message.guild.id);
    if (level) {
      message.channel.send(`🎉 Selamat **${message.author.username}**, kamu naik ke level **${level}**!`).catch(() => {});
    }
  },
};
