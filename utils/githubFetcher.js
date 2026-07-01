const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

const QUERIES = [
  'stars:>5',
  'stars:>10 pushed:>2023-01-01',
  'stars:>50 forks:>5',
  'stars:>20 language:javascript',
  'stars:>20 language:python',
  'stars:>20 language:typescript',
  'stars:>20 language:go',
  'stars:>20 language:rust',
  'stars:>20 language:java',
  'stars:>20 language:kotlin',
  'stars:>20 language:php',
  'stars:>20 language:c++',
  'stars:>20 language:swift',
  'topic:discord stars:>10',
  'topic:bot stars:>10',
  'topic:cli stars:>10',
  'topic:api stars:>50',
  'topic:database stars:>50',
  'topic:webapp stars:>50',
  'topic:docker stars:>50',
  'topic:react stars:>50',
  'topic:vue stars:>30',
  'topic:nextjs stars:>50',
  'topic:tailwindcss stars:>30',
  'topic:game-development stars:>20',
  'topic:blockchain stars:>50',
  'topic:deep-learning stars:>50',
  'topic:chatbot stars:>10',
  'topic:automation stars:>20',
];

let queryIndex = 0;

function getNextQuery() {
  const query = QUERIES[queryIndex % QUERIES.length];
  queryIndex++;
  return query;
}

async function fetchRandomRepos(count = 3) {
  const query = getNextQuery();
  const perPage = Math.min(count * 3, 30);
  const maxPages = 10;
  const randomPage = Math.floor(Math.random() * maxPages) + 1;

  try {
    const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: {
        q: query,
        sort: 'updated',
        order: 'desc',
        per_page: perPage,
        page: randomPage,
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

module.exports = { fetchRandomRepos };
