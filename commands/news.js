const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchNews, markAsSent } = require('../utils/newsFetcher');
const { fetchJobs } = require('../utils/jobFetcher');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Dapatkan informasi terkini')
    .addSubcommand(sub =>
      sub.setName('news')
        .setDescription('Berita terkini dari berbagai sumber global')
        .addStringOption(opt =>
          opt.setName('sumber')
            .setDescription('Pilih sumber berita (default: semua)')
            .setRequired(false)
            .addChoices(
              { name: 'Semua sumber', value: 'all' },
              { name: 'CNN', value: 'cnn' },
              { name: 'CNBC', value: 'cnbc' },
              { name: 'BBC News', value: 'bbc' },
              { name: 'The Guardian', value: 'guardian' },
              { name: 'NPR', value: 'npr' },
              { name: 'New York Times', value: 'nyt' },
              { name: 'Programming (Dev.to, HN, Google News)', value: 'programming' },
            )))
    .addSubcommand(sub =>
      sub.setName('jobs')
        .setDescription('Lowongan kerja IT terbaru')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'news') {
      await interaction.deferReply();
      const source = interaction.options.getString('sumber') || 'all';
      const sourceLabel = source === 'all' ? 'Semua Sumber' :
        source === 'programming' ? 'Programming' :
        source.toUpperCase();

      const sentUrls = (await db.get('sent_news_urls')) || [];
      const articles = await fetchNews(source);
      const newArticles = articles.filter(a => !sentUrls.includes(a.url));

      if (newArticles.length === 0) {
        return interaction.editReply('📭 Tidak ada berita baru. Coba pilih sumber lain atau tunggu beberapa saat.');
      }

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle(`📰 ${sourceLabel} — Berita Terbaru`)
        .setDescription(`${newArticles.length} artikel baru`)
        .setTimestamp();

      for (const article of newArticles.slice(0, 5)) {
        embed.addFields({
          name: article.title,
          value: `[Baca selengkapnya](${article.url}) — *${article.source}*`,
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
      await markAsSent(newArticles);
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
