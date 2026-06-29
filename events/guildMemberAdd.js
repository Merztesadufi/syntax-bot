const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/database');
const config = require('../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    if (member.user.bot) return;

    const verifyRoleId = await db.get(`verifyRole_${member.guild.id}`);
    const verifyChannelId = await db.get(`verifyChannel_${member.guild.id}`);

    // Auto role only if verification is NOT active
    if (!verifyRoleId) {
      const dbAutoRoleId = await db.get(`autorole_${member.guild.id}`);
      const autoRoleId = dbAutoRoleId || config.autoRoleId;
      if (autoRoleId) {
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) {
          member.roles.add(role).catch(() => {});
        }
      }
    }

    // Welcome message
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (channel) {
      const user = await client.users.fetch(member.id, { force: true }).catch(() => member.user);
      const avatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
      const banner = user.bannerURL({ dynamic: true, size: 4096 });

      const created = Math.floor(user.createdTimestamp / 1000);
      const verifiedRole = verifyRoleId ? member.guild.roles.cache.get(verifyRoleId) : null;

      const memsynRoleId = await db.get(`memsynRole_${member.guild.id}`);
      const rulesChannelId = await db.get(`rulesChannel_${member.guild.id}`);
      const rolesChannelId = await db.get(`rolesChannel_${member.guild.id}`);

      let desc = `Selamat datang **${member.user.username}** di **${member.guild.name}**! 🎉\n`;
      desc += `Kamu member ke-**${member.guild.memberCount}**\n\n`;
      desc += `📅 **Akun dibuat:** <t:${created}:D> (<t:${created}:R>)\n\n`;

      if (verifyChannelId && verifiedRole) {
        const verifyChannel = member.guild.channels.cache.get(verifyChannelId);
        if (verifyChannel) {
          desc += `━━━━━━━━━━━━━━━━━━━━━━\n`;
          desc += `**📋 ALUR ONBOARDING:**\n\n`;
          desc += `**1️⃣** Klik tombol **✅ Mulai Verifikasi** di bawah\n`;
          desc += `**2️⃣** Isi form data diri (Nama, Jurusan, dll)\n`;
          if (rulesChannelId) desc += `**3️⃣** Baca peraturan di <#${rulesChannelId}>\n`;
          if (rolesChannelId) desc += `**4️⃣** Pilih role kamu di <#${rolesChannelId}>\n`;
          desc += `**5️⃣** Dapatkan role **${verifiedRole.name}**${memsynRoleId ? ` + **<@&${memsynRoleId}>**` : ''}\n`;
          desc += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
          desc += `*Selesaikan semua langkah untuk mendapatkan akses penuh ke server!*`;
        }
      } else {
        desc += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        desc += `**📋 LANGKAH SELANJUTNYA:**\n\n`;
        desc += `**1️⃣** Baca peraturan server\n`;
        desc += `**2️⃣** Perkenalkan diri kamu\n`;
        desc += `**3️⃣** Nikmati fitur server! 🎉`;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setAuthor({ name: user.username, iconURL: avatar })
        .setDescription(desc)
        .setTimestamp();

      if (banner) {
        embed.setImage(banner);
        embed.setThumbnail(avatar);
      } else {
        embed.setImage(avatar);
      }

      const components = [];
      if (verifyChannelId && verifyRoleId && verifiedRole) {
        const verifyBtn = new ButtonBuilder()
          .setCustomId('verify_me')
          .setLabel('Verifikasi Sekarang')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅');
        components.push(new ActionRowBuilder().addComponents(verifyBtn));
      }

      channel.send({ embeds: [embed], components }).catch(() => {});
    }
  },
};
