const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false });

async function fetchNews() {
  const articles = [];

  // Indonesian tech news via Google News RSS
  try {
    const { data } = await axios.get(
      'https://news.google.com/rss/search?q=teknologi+informasi+Indonesia&hl=id&gl=ID&ceid=ID:id',
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const parsed = parser.parse(data);
    const items = parsed?.rss?.channel?.item || [];
    for (const item of (Array.isArray(items) ? items : [items]).slice(0, 3)) {
      articles.push({
        title: item.title?.replace(/<[^>]*>/g, '').trim() || '',
        url: item.link || '',
        description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 200).trim(),
        source: 'Google News Indonesia',
        tags: 'teknologi',
      });
    }
  } catch (e) { /* silent */ }

  // Dev.to - programming articles
  try {
    const { data } = await axios.get('https://dev.to/api/articles?tag=programming&per_page=5', { timeout: 10000 });
    for (const article of data.slice(0, 3)) {
      articles.push({
        title: article.title,
        url: article.url,
        description: article.description?.slice(0, 200) || 'Baca selengkapnya...',
        source: 'Dev.to',
        tags: article.tag_list?.join(', ') || 'programming',
      });
    }
  } catch (e) { /* silent */ }

  // Hacker News
  try {
    const { data } = await axios.get('https://hn.algolia.com/api/v1/search?query=programming&tags=story&hitsPerPage=5', { timeout: 10000 });
    for (const hit of data.hits?.slice(0, 3) || []) {
      articles.push({
        title: hit.title,
        url: hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        description: `${hit.points || 0} points | ${hit.author}`,
        source: 'Hacker News',
        tags: 'programming',
      });
    }
  } catch (e) { /* silent */ }

  return articles;
}

module.exports = { fetchNews };
