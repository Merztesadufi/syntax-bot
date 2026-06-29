const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchNews } = require('../utils/newsFetcher');
const { fetchJobs } = require('../utils/jobFetcher');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Dapatkan informasi terkini')
    .addSubcommand(sub =>
      sub.setName('news')
        .setDescription('Berita programming terkini'))
    .addSubcommand(sub =>
      sub.setName('jobs')
        .setDescription('Lowongan kerja IT terbaru')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'news') {
      await interaction.deferReply();
      const articles = await fetchNews();
      if (articles.length === 0) {
        return interaction.editReply('❌ Gagal mengambil berita. Coba lagi nanti.');
      }

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('📰 Berita Programming Terbaru')
        .setTimestamp();

      for (const article of articles.slice(0, 5)) {
        embed.addFields({
          name: article.title,
          value: `[Baca selengkapnya](${article.url}) — *${article.source}*`,
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'jobs') {
      await interaction.deferReply();
      const jobs = await fetchJobs();
      if (jobs.length === 0) {
        return interaction.editReply('❌ Gagal mengambil lowongan. Coba lagi nanti.');
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('💼 Lowongan Kerja IT Terbaru')
        .setTimestamp();

      for (const job of jobs.slice(0, 5)) {
        embed.addFields({
          name: `${job.title} — ${job.company}`,
          value: `📍 ${job.location} | [Lamar](${job.url}) | *${job.source}*`,
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
