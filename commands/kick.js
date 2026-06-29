const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member dari server')
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('Member yang ingin di-kick')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('member');
    const alasan = interaction.options.getString('alasan') || 'Tidak ada alasan';

    if (!target) {
      return interaction.reply({ content: '❌ Member tidak ditemukan di server ini.', ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Kamu tidak bisa kick diri sendiri.', ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ Kamu tidak bisa kick bot.', ephemeral: true });
    }

    if (!target.kickable) {
      return interaction.reply({ content: '❌ Role kamu tidak cukup tinggi untuk kick member ini.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('👢 Member Dikick')
        .addFields(
          { name: 'Member', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Oleh', value: interaction.user.tag, inline: true },
          { name: 'Alasan', value: alasan, inline: false },
        )
        .setTimestamp();

      await target.kick(alasan);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: '❌ Gagal melakukan kick. Periksa permission bot.' });
    }
  },
};
