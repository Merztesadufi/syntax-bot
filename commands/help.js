const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lihat semua perintah bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🚀 Syntax Bot — Daftar Perintah')
      .setDescription('Bot multi-fitur untuk server Discord kamu!')
      .addFields(
        { name: '🛡️ `/role`', value: 'List, auto, buat (dengan permission), hapus, beri/hapus role', inline: false },
        { name: '🧹 `/clean`', value: 'Hapus pesan massal (1-100)', inline: false },
        { name: '✅ `/verify setup`', value: 'Pasang sistem verifikasi member', inline: false },
        { name: '✅ `/verify status`', value: 'Cek status verifikasi', inline: false },
        { name: '🎫 `/ticket setup`', value: 'Pasang panel ticket', inline: false },
        { name: '🎫 `/ticket close`', value: 'Tutup ticket', inline: false },
        { name: '📊 `/level rank`', value: 'Cek level & XP kamu', inline: false },
        { name: '📊 `/level leaderboard`', value: 'Top 10 server', inline: false },
        { name: '📘 `/coding`', value: 'Belajar C++ / JavaScript dasar', inline: false },
        { name: '📰 `/info news`', value: 'Berita programming terkini', inline: false },
        { name: '💼 `/info jobs`', value: 'Lowongan IT Indonesia & Remote', inline: false },
        { name: '❓ `/help`', value: 'Panduan ini', inline: false },
      )
      .setFooter({ text: 'Syntax Bot © 2026' });

    await interaction.reply({ embeds: [embed] });
  },
};
