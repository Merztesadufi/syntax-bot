const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const db = require('./database');

const parser = new XMLParser({ ignoreAttributes: false });

const RSS_SOURCES = {
  cnn: { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss' },
  cnbc: { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114' },
  bbc: { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  guardian: { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
  npr: { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml' },
  nyt: { name: 'New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
};

async function fetchFromRSS(sourceKey) {
  const src = RSS_SOURCES[sourceKey];
  if (!src) return [];

  try {
    const { data } = await axios.get(src.url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SyntaxBot/1.0)' },
    });
    const parsed = parser.parse(data);
    const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
    const list = Array.isArray(items) ? items : [items];

    return list.slice(0, 5).map(item => ({
      title: (item.title || item.title?.['#text'] || '').replace(/<[^>]*>/g, '').trim(),
      url: item.link?.href || item.link || item.guid?.['#text'] || item.id || '',
      description: (item.description || item.summary || item.contentSnippet || '')
        .replace(/<[^>]*>/g, '').slice(0, 250).trim(),
      source: src.name,
    }));
  } catch {
    return [];
  }
}

async function fetchProgrammingNews() {
  const articles = [];

  try {
    const { data } = await axios.get('https://news.google.com/rss/search?q=teknologi+informasi+Indonesia&hl=id&gl=ID&ceid=ID:id', {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const parsed = parser.parse(data);
    const items = parsed?.rss?.channel?.item || [];
    for (const item of (Array.isArray(items) ? items : [items]).slice(0, 3)) {
      articles.push({
        title: item.title?.replace(/<[^>]*>/g, '').trim() || '',
        url: item.link || '',
        description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 250).trim(),
        source: 'Google News Indonesia',
      });
    }
  } catch {}

  try {
    const { data } = await axios.get('https://dev.to/api/articles?tag=programming&per_page=5', { timeout: 10000 });
    for (const article of data.slice(0, 3)) {
      articles.push({
        title: article.title,
        url: article.url,
        description: article.description?.slice(0, 250) || 'Baca selengkapnya...',
        source: 'Dev.to',
      });
    }
  } catch {}

  try {
    const { data } = await axios.get('https://hn.algolia.com/api/v1/search?query=programming&tags=story&hitsPerPage=5', { timeout: 10000 });
    for (const hit of data.hits?.slice(0, 3) || []) {
      articles.push({
        title: hit.title,
        url: hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        description: `${hit.points || 0} points | ${hit.author}`,
        source: 'Hacker News',
      });
    }
  } catch {}

  return articles;
}

async function fetchNews(sourceKey) {
  let articles = [];

  if (sourceKey === 'programming') {
    articles = await fetchProgrammingNews();
  } else if (sourceKey && RSS_SOURCES[sourceKey]) {
    articles = await fetchFromRSS(sourceKey);
  } else {
    const [rssResults, legacy] = await Promise.all([
      Promise.all(Object.keys(RSS_SOURCES).map(key => fetchFromRSS(key))),
      fetchProgrammingNews(),
    ]);
    articles = [...rssResults.flat(), ...legacy];
  }

  const seen = new Set();
  articles = articles.filter(a => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  return articles.slice(0, 10);
}

async function markAsSent(articles) {
  const sentUrls = (await db.get('sent_news_urls')) || [];
  const newUrls = articles.map(a => a.url).filter(Boolean);
  const updated = [...new Set([...sentUrls, ...newUrls])];
  if (updated.length > 1000) updated.splice(0, updated.length - 1000);
  await db.set('sent_news_urls', updated);
}

module.exports = { fetchNews, markAsSent };
