const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false });

async function fetchIndeedIndonesia() {
  const jobs = [];

  try {
    const queries = ['programmer+IT+informatika', 'software+engineer+indonesia', 'web+developer+indonesia', 'IT+support+indonesia'];
    for (const q of queries) {
      const { data } = await axios.get(`https://id.indeed.com/rss?q=${q}&l=Indonesia`, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const parsed = parser.parse(data);
      const items = parsed?.rss?.channel?.item || [];

      for (const item of (Array.isArray(items) ? items : [items])) {
        const title = item.title?.replace(/<[^>]*>/g, '').trim() || '';
        if (!title) continue;

        jobs.push({
          title,
          company: (item.source || item['dc:creator'] || 'Unknown').replace(/<[^>]*>/g, '').trim(),
          url: item.link || '',
          location: 'Indonesia',
          description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 200).trim(),
          source: 'Indeed Indonesia',
        });
      }
    }
  } catch (e) { /* silent */ }

  return jobs;
}

async function fetchJobs() {
  const jobs = [];

  // Indonesian job sources
  const indeedJobs = await fetchIndeedIndonesia();
  jobs.push(...indeedJobs);

  // Global remote jobs (bonus)
  try {
    const { data } = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=5', { timeout: 10000 });
    for (const job of data.jobs || []) {
      jobs.push({
        title: job.title,
        company: job.company_name,
        url: job.url,
        location: (job.candidate_required_location || 'Remote') + ' (Remote)',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
        source: 'Remotive',
      });
    }
  } catch (e) { /* silent */ }

  return jobs;
}

module.exports = { fetchJobs };
