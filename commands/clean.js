const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Hapus pesan di channel')
    .addIntegerOption(opt =>
      opt.setName('jumlah')
        .setDescription('Jumlah pesan (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('Hapus pesan dari member tertentu saja')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const jumlah = interaction.options.getInteger('jumlah');
    const target = interaction.options.getMember('member');

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: jumlah });

      let toDelete;
      if (target) {
        toDelete = messages.filter(m => m.author.id === target.id);
      } else {
        toDelete = messages;
      }

      const deleted = await interaction.channel.bulkDelete(toDelete, true);
      await interaction.editReply({ content: `✅ Berhasil menghapus **${deleted.size}** pesan${target ? ` dari **${target.user.username}**` : ''}.` });
    } catch {
      await interaction.editReply({ content: '❌ Gagal menghapus pesan. Pastikan pesan tidak lebih dari 14 hari.' });
    }
  },
};
