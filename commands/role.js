const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const WARNA = {
  merah: '#FF0000', red: '#FF0000',
  hijau: '#00FF00', green: '#00FF00',
  biru: '#0000FF', blue: '#0000FF',
  kuning: '#FFFF00', yellow: '#FFFF00',
  ungu: '#800080', purple: '#800080',
  orange: '#FFA500', jingga: '#FFA500',
  pink: '#FFC0CB', merahmuda: '#FFC0CB',
  hitam: '#000000', black: '#000000',
  putih: '#FFFFFF', white: '#FFFFFF',
  abu: '#808080', gray: '#808080', grey: '#808080',
  emas: '#FFD700', gold: '#FFD700',
  perak: '#C0C0C0', silver: '#C0C0C0',
  birumuda: '#00BFFF', cyan: '#00BFFF',
  hijau: '#00FF00',
  coklat: '#8B4513', brown: '#8B4513',
  maroon: '#800000',
  navy: '#000080',
  toska: '#40E0D0', teal: '#008080',
  coral: '#FF7F50',
  salmon: '#FA8072',
  violet: '#EE82EE',
  indigo: '#4B0082',
  lime: '#32CD32',
  crimson: '#DC143C',
  default: '#99AAB5',
};

function resolveWarna(input) {
  if (!input) return '#99AAB5';
  const key = input.toLowerCase().replace(/\s+/g, '');
  if (WARNA[key]) return WARNA[key];
  if (/^#?[0-9a-f]{6}$/i.test(input)) return input.startsWith('#') ? input : `#${input}`;
  return null;
}

const WARNA_EMOJI = [
  { max: 0xFFFFFF, emoji: '⬜' },
  { max: 0xFFAA00, emoji: '🟧' },
  { max: 0xFF5500, emoji: '🟠' },
  { max: 0xFF0000, emoji: '🟥' },
  { max: 0xAA00FF, emoji: '🟪' },
  { max: 0x5500FF, emoji: '🟣' },
  { max: 0x0000FF, emoji: '🟦' },
  { max: 0x00AAFF, emoji: '🔵' },
  { max: 0x00FFFF, emoji: '🩵' },
  { max: 0x00FF00, emoji: '🟩' },
  { max: 0xAAFF00, emoji: '🟢' },
  { max: 0xFFFF00, emoji: '🟨' },
  { max: 0xAA5500, emoji: '🟫' },
  { max: 0x000000, emoji: '⬛' },
];

function colorEmoji(color) {
  if (!color || color === 0) return '⬜';
  const entry = WARNA_EMOJI.find(e => color >= e.max);
  return entry ? entry.emoji : '🎨';
}

const ROLE_EMOJI = [
  { keywords: ['admin', 'administrator', 'owner', 'founder'], emoji: '⚙️' },
  { keywords: ['mod', 'moderator', 'staff', 'team'], emoji: '🛡️' },
  { keywords: ['member', 'anggota', 'warga'], emoji: '👤' },
  { keywords: ['vip', 'premium', 'donatur', 'supporter', 'boost', 'donor'], emoji: '⭐' },
  { keywords: ['dev', 'developer', 'programmer', 'coder', 'coding', 'program', 'web', 'js', 'javascript', 'python', 'java', 'cpp', 'c++', 'software', 'engineer', 'backend', 'frontend', 'fullstack', 'security', 'hacker'], emoji: '💻' },
  { keywords: ['design', 'designer', 'ui', 'ux', 'art', 'artist', 'creative'], emoji: '🎨' },
  { keywords: ['event', 'manager', 'lead', 'leader', 'coordinator', 'ketua'], emoji: '📋' },
  { keywords: ['bot'], emoji: '🤖' },
  { keywords: ['news', 'berita', 'info', 'announcement', 'pengumuman'], emoji: '📢' },
  { keywords: ['lomba', 'competition', 'contest', 'turnamen', 'game', 'gaming', 'player'], emoji: '🎮' },
  { keywords: ['siswa', 'student', 'pelajar', 'mahasiswa', 'genius', 'pintar', 'bijak', 'ambisius', 'cerdas'], emoji: '📚' },
  { keywords: ['contributor', 'kontributor', 'problem solver', 'critical'], emoji: '🏆' },
  { keywords: ['claude', 'ai', 'artificial'], emoji: '🧠' },
  { keywords: ['musik', 'music', 'singer', 'song'], emoji: '🎵' },
  { keywords: ['youtube', 'streamer', 'content', 'creator', 'influencer'], emoji: '📹' },
];

function roleEmoji(name) {
  const lowered = name.toLowerCase();
  for (const entry of ROLE_EMOJI) {
    if (entry.keywords.some(k => lowered.includes(k))) return entry.emoji;
  }
  return '🏷️';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Kelola role')
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Lihat semua role yang tersedia di server'))
    .addSubcommand(sub =>
      sub.setName('auto')
        .setDescription('Set auto-role untuk member baru')
        .addRoleOption(opt => opt.setName('role').setDescription('Role yang diberikan otomatis').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Buat role baru otomatis')
        .addStringOption(opt => opt.setName('nama').setDescription('Nama role').setRequired(true))
        .addStringOption(opt => opt.setName('warna').setDescription('Nama warna (merah, hijau, biru, dll)').setRequired(false))
        .addStringOption(opt => opt.setName('permission')
          .setDescription('Level permission role')
          .addChoices(
            { name: 'Tidak Ada (default)', value: 'none' },
            { name: 'Administrator (full akses)', value: 'admin' },
            { name: 'Moderator (kick, ban, mute, hapus pesan)', value: 'mod' },
            { name: 'Staff (hapus pesan, mute)', value: 'staff' },
          ).setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('give')
        .setDescription('Beri role ke member')
        .addUserOption(opt => opt.setName('member').setDescription('Pilih member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Pilih role').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Hapus satu role')
        .addRoleOption(opt => opt.setName('role').setDescription('Pilih role yang dihapus').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('createall')
        .setDescription('Buat beberapa role sekaligus (format: Nama=Warna, Nama=Warna)')
        .addStringOption(opt => opt.setName('daftar').setDescription('Contoh: Moderator=merah, Member=hijau, VIP=emas').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('deleteall')
        .setDescription('Hapus beberapa role sekaligus (pisahkan dengan spasi)')
        .addStringOption(opt => opt.setName('roles').setDescription('Nama/ID/Mention role (pisahkan dengan koma)').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('user')
        .setDescription('Cek role seorang member (atau diri sendiri)')
        .addUserOption(opt => opt.setName('member').setDescription('Pilih member (kosongkan untuk cek sendiri)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('fix')
        .setDescription('Tambahkan emoji otomatis ke semua role yang sudah ada'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const roleList = interaction.guild.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => {
          const e = roleEmoji(r.name);
          const c = colorEmoji(r.color);
          return `${e} ${c} **${r.name}** — ${r.members.size} member`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📋 Daftar Role')
        .setDescription(roleList || 'Tidak ada role lain.')
        .setFooter({ text: `Total ${interaction.guild.roles.cache.size - 1} role` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'auto') {
      const role = interaction.options.getRole('role');
      const db = require('../utils/database');
      await db.set(`autorole_${interaction.guild.id}`, role.id);
      await interaction.reply({ content: `✅ Auto-role diatur ke **${role.name}** untuk member baru.`, ephemeral: true });
    }

    if (sub === 'create') {
      let nama = interaction.options.getString('nama');
      const warnaInput = interaction.options.getString('warna');
      const permLevel = interaction.options.getString('permission') || 'none';
      const warna = resolveWarna(warnaInput);

      if (!warna) {
        const daftar = Object.keys(WARNA).filter(k => k !== 'default').join(', ');
        return interaction.reply({ content: `❌ Warna \`${warnaInput}\` tidak dikenal. Coba: ${daftar}`, ephemeral: true });
      }

      const emoji = roleEmoji(nama);
      if (!/^\p{Extended_Pictographic}/u.test(nama)) {
        nama = `${emoji} ${nama}`;
      }

      const permissionsMap = {
        none: 0n,
        admin: PermissionFlagsBits.Administrator,
        mod: PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.ManageMessages,
        staff: PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ModerateMembers,
      };

      try {
        const role = await interaction.guild.roles.create({
          name: nama,
          color: warna,
          permissions: permissionsMap[permLevel] || 0n,
          reason: `Dibuat oleh ${interaction.user.tag}`,
        });
        const permLabels = { none: 'tidak ada', admin: 'Administrator', mod: 'Moderator', staff: 'Staff' };
        await interaction.reply({ content: `✅ Role **${role.name}** berhasil dibuat! Permission: **${permLabels[permLevel]}**.`, ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: `❌ Gagal: ${err.message}`, ephemeral: true });
      }
    }

    if (sub === 'give') {
      const member = interaction.options.getMember('member');
      const role = interaction.options.getRole('role');

      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `✅ Role **${role.name}** dihapus dari **${member.user.username}**.`, ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `✅ Role **${role.name}** diberikan ke **${member.user.username}**.`, ephemeral: true });
      }
    }

    if (sub === 'user') {
      const target = interaction.options.getMember('member') || interaction.member;
      const roles = target.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `${roleEmoji(r.name)} ${r}`)
        .join('\n') || 'Tidak punya role lain.';

      const embed = new EmbedBuilder()
        .setColor(target.displayColor || 0x5865F2)
        .setAuthor({ name: target.user.username, iconURL: target.user.displayAvatarURL({ dynamic: true }) })
        .setTitle('🎭 Role Member')
        .setDescription(roles)
        .setFooter({ text: `Total ${target.roles.cache.size - 1} role` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'createall') {
      const daftar = interaction.options.getString('daftar');
      const entries = daftar.split(',').map(e => e.trim()).filter(Boolean);

      const results = [];
      await interaction.deferReply({ ephemeral: true });

      for (const entry of entries) {
        let [nama, warnaInput] = entry.split('=').map(s => s.trim());
        if (!nama) continue;

        const warna = resolveWarna(warnaInput || '');

        const emoji = roleEmoji(nama);
        if (!/^\p{Extended_Pictographic}/u.test(nama)) {
          nama = `${emoji} ${nama}`;
        }

        try {
          await interaction.guild.roles.create({
            name: nama,
            color: warna,
            reason: `Dibuat oleh ${interaction.user.tag}`,
          });
          results.push(`✅ ${nama}`);
        } catch (err) {
          results.push(`❌ ${nama}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 1500));
      }

      await interaction.editReply({ content: results.join('\n') });
    }

    if (sub === 'delete') {
      const role = interaction.options.getRole('role');

      if (role.id === interaction.guild.id) {
        return interaction.reply({ content: '❌ Tidak bisa menghapus role @everyone.', ephemeral: true });
      }

      if (role.comparePositionTo(interaction.member.roles.highest) >= 0 && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Role tersebut lebih tinggi atau setara dengan role kamu.', ephemeral: true });
      }

      try {
        await role.delete(`Dihapus oleh ${interaction.user.tag}`);
        await interaction.reply({ content: `✅ Role **${role.name}** berhasil dihapus!`, ephemeral: true });
      } catch {
        await interaction.reply({ content: '❌ Gagal menghapus role. Periksa permission saya.', ephemeral: true });
      }
    }

    if (sub === 'deleteall') {
      const rolesInput = interaction.options.getString('roles');
      const guildRoles = interaction.guild.roles.cache;
      const roleNames = rolesInput.split(',').map(r => r.trim()).filter(Boolean);

      const toDelete = [];
      const notFound = [];

      for (const name of roleNames) {
        const cleaned = name.replace(/[<@&>]/g, '');
        let role = guildRoles.get(cleaned);

        if (!role) {
          const lowered = cleaned.toLowerCase();
          role = guildRoles.find(r => r.name.toLowerCase() === lowered);
        }

        if (!role) {
          notFound.push(name);
        } else if (role.id === interaction.guild.id) {
          notFound.push(`${name} (@everyone tidak bisa dihapus)`);
        } else if (role.comparePositionTo(interaction.member.roles.highest) >= 0 && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          notFound.push(`${name} (terlalu tinggi)`);
        } else {
          toDelete.push(role);
        }
      }

      if (toDelete.length === 0) {
        return interaction.reply({ content: `❌ Tidak ada role yang bisa dihapus.${notFound.length ? `\nGagal: ${notFound.join(', ')}` : ''}`, ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      let deleted = 0;
      for (const role of toDelete) {
        try {
          await role.delete(`Dihapus oleh ${interaction.user.tag}`);
          deleted++;
        } catch { /* skip */ }
      }

      let msg = `✅ Berhasil menghapus **${deleted}** role.`;
      if (notFound.length) msg += `\n⚠️ Gagal: ${notFound.join(', ')}`;
      if (toDelete.length - deleted > 0) msg += `\n⚠️ ${toDelete.length - deleted} role gagal dihapus (periksa permission).`;

      await interaction.editReply({ content: msg });
    }

    if (sub === 'fix') {
      const roles = interaction.guild.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position);

      const results = [];
      await interaction.deferReply({ ephemeral: true });

      for (const role of roles.values()) {
        const oldName = role.name;
        const emoji = roleEmoji(oldName);
        if (/^\p{Extended_Pictographic}/u.test(oldName)) continue;

        try {
          await role.setName(`${emoji} ${oldName}`, `Fix emoji oleh ${interaction.user.tag}`);
          results.push(`✅ ${oldName} → ${emoji} ${oldName}`);
        } catch { /* skip rate limited / permission */ }
        await new Promise(r => setTimeout(r, 1000));
      }

      await interaction.editReply({ content: results.length ? `✅ Berhasil menambahkan emoji ke **${results.length}** role.\n${results.join('\n')}` : '✅ Semua role sudah memiliki emoji.' });
    }
  },
};
