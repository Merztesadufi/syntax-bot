const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRank, getLeaderboard } = require('../utils/leveling');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Cek level & leaderboard')
    .addSubcommand(sub =>
      sub.setName('rank')
        .setDescription('Cek rank kamu')
        .addUserOption(opt => opt.setName('member').setDescription('Lihat rank member lain').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('leaderboard')
        .setDescription('Top 10 leaderboard')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'rank') {
      const target = interaction.options.getMember('member') || interaction.member;
      const rank = await getRank(target.id, interaction.guild.id);

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`📊 Level - ${target.user.username}`)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Level', value: `${rank.level}`, inline: true },
          { name: 'XP', value: `${rank.xp} / ${rank.xpNeeded}`, inline: true },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    if (sub === 'leaderboard') {
      const entries = await getLeaderboard(interaction.guild.id);
      if (entries.length === 0) {
        return interaction.reply({ content: 'Belum ada data leveling di server ini.', ephemeral: true });
      }

      let desc = '';
      for (let i = 0; i < entries.length; i++) {
        const member = await interaction.guild.members.fetch(entries[i].userId).catch(() => null);
        const name = member ? member.user.username : 'Unknown';
        desc += `**${i + 1}.** ${name} — Level ${entries[i].level} (${entries[i].xp} XP)\n`;
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏆 Leaderboard')
        .setDescription(desc)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
