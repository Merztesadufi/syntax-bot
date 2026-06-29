const { ActivityType } = require('discord.js');
const { fetchNews } = require('../utils/newsFetcher');
const { fetchJobs } = require('../utils/jobFetcher');
const { registerCommands } = require('../handlers/commandHandler');
const config = require('../config');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`[READY] ${client.user.tag} is online!`);
    await registerCommands(client);

    client.user.setPresence({
      activities: [{ name: 'Syntax Bot 🚀', type: ActivityType.Playing }],
      status: 'online',
    });

    const newsChannel = client.channels.cache.get(config.newsChannelId);
    const jobChannel = client.channels.cache.get(config.jobChannelId);

    const postNews = async () => {
      if (!newsChannel) return;
      const articles = await fetchNews();
      for (const article of articles.slice(0, 2)) {
        const embed = {
          color: 0x00AE86,
          title: `📰 ${article.title}`,
          url: article.url,
          description: article.description,
          fields: [
            { name: 'Sumber', value: article.source, inline: true },
            { name: 'Tag', value: article.tags, inline: true },
          ],
          timestamp: new Date(),
        };
        newsChannel.send({ embeds: [embed] }).catch(() => {});
      }
    };

    const postJobs = async () => {
      if (!jobChannel) return;
      const jobs = await fetchJobs();
      for (const job of jobs.slice(0, 2)) {
        const embed = {
          color: 0x3498DB,
          title: `💼 ${job.title}`,
          url: job.url,
          description: job.description.slice(0, 200),
          fields: [
            { name: 'Perusahaan', value: job.company, inline: true },
            { name: 'Lokasi', value: job.location, inline: true },
            { name: 'Sumber', value: job.source, inline: true },
          ],
          timestamp: new Date(),
        };
        jobChannel.send({ embeds: [embed] }).catch(() => {});
      }
    };

    postNews();
    postJobs();

    setInterval(postNews, config.news.intervalMinutes * 60 * 1000);
    setInterval(postJobs, config.jobs.intervalMinutes * 60 * 1000);
  },
};
