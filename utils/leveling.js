const db = require('./database');
const config = require('../config');

async function addXP(userId, guildId) {
  const key = `leveling_${guildId}_${userId}`;
  const now = Date.now();

  let data = await db.get(key);
  if (!data) {
    data = { xp: 0, level: 1, lastMessage: 0 };
  }

  if (now - data.lastMessage < config.leveling.xpCooldown) return null;

  const xpGain = Math.floor(Math.random() * (config.leveling.xpMax - config.leveling.xpMin + 1)) + config.leveling.xpMin;
  data.xp += xpGain;
  data.lastMessage = now;

  const xpNeeded = data.level * 100;
  let leveledUp = false;
  while (data.xp >= xpNeeded) {
    data.xp -= xpNeeded;
    data.level++;
    leveledUp = true;
  }

  await db.set(key, data);
  return leveledUp ? data.level : null;
}

async function getRank(userId, guildId) {
  const key = `leveling_${guildId}_${userId}`;
  const data = await db.get(key);
  if (!data) return { level: 1, xp: 0, xpNeeded: 100 };

  return {
    level: data.level,
    xp: data.xp,
    xpNeeded: data.level * 100,
  };
}

async function getLeaderboard(guildId) {
  const all = await db.all();
  const prefix = `leveling_${guildId}_`;
  const entries = all
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, val]) => ({ userId: key.replace(prefix, ''), ...val }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10);
  return entries;
}

module.exports = { addXP, getRank, getLeaderboard };
