const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer, useQueue, useTimeline } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('🎵 Putar lagu dari YouTube/Spotify')
    .addSubcommand(sub =>
      sub.setName('play')
        .setDescription('Putar lagu dari YouTube/Spotify')
        .addStringOption(opt => opt.setName('query').setDescription('Nama lagu atau URL YouTube/Spotify').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('skip')
        .setDescription('Lewati lagu saat ini'))
    .addSubcommand(sub =>
      sub.setName('stop')
        .setDescription('Hentikan pemutaran & bersihkan antrian'))
    .addSubcommand(sub =>
      sub.setName('pause')
        .setDescription('Jeda lagu'))
    .addSubcommand(sub =>
      sub.setName('resume')
        .setDescription('Lanjutkan lagu'))
    .addSubcommand(sub =>
      sub.setName('queue')
        .setDescription('Lihat antrian lagu'))
    .addSubcommand(sub =>
      sub.setName('nowplaying')
        .setDescription('Lihat lagu yang sedang diputar'))
    .addSubcommand(sub =>
      sub.setName('volume')
        .setDescription('Atur volume (1-100)')
        .addIntegerOption(opt => opt.setName('level').setDescription('Volume 1-100').setRequired(true).setMinValue(1).setMaxValue(100)))
    .addSubcommand(sub =>
      sub.setName('lyrics')
        .setDescription('Cari lirik lagu')
        .addStringOption(opt => opt.setName('judul').setDescription('Judul lagu (kosongkan untuk lagu yang sedang diputar)').setRequired(false))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const player = useMainPlayer();
    const queue = useQueue(interaction.guild.id);
    const timeline = useTimeline(interaction.guild.id);
    const channel = interaction.member.voice.channel;

    if (sub === 'play') {
      if (!channel) return interaction.reply({ content: '❌ Kamu harus join voice channel dulu!', ephemeral: true });

      const query = interaction.options.getString('query');
      await interaction.deferReply();

      try {
        const { track } = await player.play(channel, query, {
          nodeOptions: {
            metadata: interaction,
            leaveOnEnd: false,
            leaveOnEmpty: true,
            leaveOnStop: true,
            selfDeaf: true,
          },
        });

        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setAuthor({ name: 'Ditambahkan ke Antrian', iconURL: 'https://cdn.discordapp.com/emojis/758423321194692608.png' })
          .setTitle(track.title)
          .setURL(track.url)
          .setThumbnail(track.thumbnail)
          .addFields(
            { name: 'Artist', value: track.author, inline: true },
            { name: 'Durasi', value: track.duration, inline: true },
            { name: 'Sumber', value: track.queryType || 'YouTube', inline: true },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      } catch (e) {
        return interaction.editReply({ content: `❌ Gagal memutar: ${e.message}` });
      }
    }

    if (sub === 'skip') {
      if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar.', ephemeral: true });
      queue.node.skip();
      return interaction.reply({ content: '⏭️ Lagu dilewati!', ephemeral: true });
    }

    if (sub === 'stop') {
      if (!queue) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar.', ephemeral: true });
      queue.delete();
      return interaction.reply({ content: '⏹️ Pemutaran dihentikan & antrian dibersihkan.', ephemeral: true });
    }

    if (sub === 'pause') {
      if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar.', ephemeral: true });
      if (timeline.paused) return interaction.reply({ content: '⚠️ Lagu sudah dijeda.', ephemeral: true });
      timeline.paused = true;
      return interaction.reply({ content: '⏸️ Lagu dijeda.', ephemeral: true });
    }

    if (sub === 'resume') {
      if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar.', ephemeral: true });
      if (!timeline.paused) return interaction.reply({ content: '⚠️ Lagu sedang diputar.', ephemeral: true });
      timeline.paused = false;
      return interaction.reply({ content: '▶️ Lagu dilanjutkan.', ephemeral: true });
    }

    if (sub === 'volume') {
      if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar.', ephemeral: true });
      const level = interaction.options.getInteger('level');
      queue.node.setVolume(level);
      return interaction.reply({ content: `🔊 Volume diatur ke **${level}%**`, ephemeral: true });
    }

    if (sub === 'queue') {
      if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu dalam antrian.', ephemeral: true });

      const tracks = queue.tracks.toArray();
      const current = timeline.track;

      let desc = `**Sedang Diputar:**\n🎵 [${current.title}](${current.url}) — ${current.author} \`[${current.duration}]\`\n\n`;

      if (tracks.length > 0) {
        desc += `**Antrian (${tracks.length} lagu):**\n`;
        desc += tracks.slice(0, 10).map((t, i) => `${i + 1}. [${t.title}](${t.url}) — ${t.author} \`[${t.duration}]\``).join('\n');
        if (tracks.length > 10) desc += `\n*...dan ${tracks.length - 10} lagu lainnya*`;
      } else {
        desc += '*Tidak ada antrian.*';
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📜 Antrian Musik')
        .setDescription(desc)
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'nowplaying') {
      if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar.', ephemeral: true });

      const track = timeline.track;
      const progress = queue.node.createProgressBar({ timecodes: true });
      const vol = queue.node.volume;

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🎵 Sedang Diputar')
        .setDescription(`**[${track.title}](${track.url})** — ${track.author}`)
        .setThumbnail(track.thumbnail)
        .addFields(
          { name: 'Progress', value: progress || '🔴 Live', inline: false },
          { name: 'Durasi', value: track.duration, inline: true },
          { name: 'Volume', value: `${vol}%`, inline: true },
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'lyrics') {
      let judul = interaction.options.getString('judul');

      if (!judul) {
        if (!queue || !timeline?.track) return interaction.reply({ content: '❌ Tidak ada lagu yang diputar. Beri judul lagu untuk mencari lirik.', ephemeral: true });
        judul = `${timeline.track.title} ${timeline.track.author}`;
      }

      await interaction.deferReply({ ephemeral: true });

      try {
        const lyricsFinder = require('lyrics-finder');
        let lyrics = await lyricsFinder(judul);

        if (!lyrics) {
          const parts = judul.split(' ').slice(-2);
          lyrics = await lyricsFinder(parts.join(' '));
        }

        if (!lyrics) return interaction.editReply({ content: `❌ Lirik tidak ditemukan untuk **${judul}**.` });

        if (lyrics.length > 4096) {
          lyrics = lyrics.slice(0, 4093) + '...';
        }

        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle(`📜 Lirik — ${judul}`)
          .setDescription(lyrics)
          .setFooter({ text: 'Lyrics via lyrics-finder' })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      } catch (e) {
        return interaction.editReply({ content: `❌ Gagal mencari lirik: ${e.message}` });
      }
    }
  },
};
