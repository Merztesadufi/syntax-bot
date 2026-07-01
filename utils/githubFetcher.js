const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

async function fetchTrendingRepos(count = 5) {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const dateStr = date.toISOString().split('T')[0];

  try {
    const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: {
        q: `created:>${dateStr} stars:>100`,
        sort: 'stars',
        order: 'desc',
        per_page: count * 2,
      },
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SyntaxBot/1.0',
      },
      timeout: 10000,
    });

    return (data.items || []).slice(0, count).map(repo => ({
      name: repo.full_name,
      url: repo.html_url,
      description: (repo.description || 'No description').slice(0, 300),
      stars: repo.stargazers_count.toLocaleString(),
      forks: repo.forks_count.toLocaleString(),
      language: repo.language || 'Unknown',
      owner: repo.owner?.login || 'unknown',
      avatar: repo.owner?.avatar_url || '',
      topics: (repo.topics || []).slice(0, 5),
    }));
  } catch {
    return [];
  }
}

module.exports = { fetchTrendingRepos };
