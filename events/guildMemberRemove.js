const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    if (member.user.bot) return;

    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('👋 Sampai Jumpa!')
        .setDescription(`**${member.user.username}** telah keluar dari server.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      channel.send({ embeds: [embed] }).catch(console.error);
    }
  },
};
