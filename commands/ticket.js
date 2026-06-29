const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Sistem Ticket')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Buat panel ticket')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel panel').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('close')
        .setDescription('Tutup ticket ini')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Hanya admin!', ephemeral: true });
      }

      const channel = interaction.options.getChannel('channel');

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('🎫 Buat Ticket')
        .setDescription('Klik tombol di bawah untuk membuat ticket support.');

      const button = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Buat Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫');

      const row = new ActionRowBuilder().addComponents(button);

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Panel ticket terpasang di ${channel}.`, ephemeral: true });
    }

    if (sub === 'close') {
      const db = require('../utils/database');

      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ Ini bukan channel ticket.', ephemeral: true });
      }

      const ownerId = await db.get(`ticket_${interaction.channel.id}`);
      if (interaction.user.id !== ownerId && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Hanya pembuat ticket atau admin yang bisa menutup.', ephemeral: true });
      }

      await interaction.reply({ content: '🔒 Ticket akan ditutup dalam 5 detik...' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  },
};
