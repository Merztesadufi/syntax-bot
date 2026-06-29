const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Sistem verifikasi member')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Pasang panel verifikasi di channel ini')
        .addRoleOption(opt => opt.setName('role').setDescription('Role utama setelah verifikasi (contoh: Verified)').setRequired(true))
        .addRoleOption(opt => opt.setName('role2').setDescription('Role tambahan (contoh: Memsyn)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('setrules')
        .setDescription('Set channel untuk baca peraturan')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel rules').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('setroles')
        .setDescription('Set channel untuk pemilihan role')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel role selection').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Cek status verifikasi server ini')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Hanya admin!', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      const role = interaction.options.getRole('role');
      const role2 = interaction.options.getRole('role2');

      await db.set(`verifyRole_${interaction.guild.id}`, role.id);
      await db.set(`verifyChannel_${interaction.guild.id}`, interaction.channel.id);
      if (role2) await db.set(`memsynRole_${interaction.guild.id}`, role2.id);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('✅ Verifikasi Member')
        .setDescription('Klik tombol di bawah untuk memulai verifikasi dan mengisi data diri.')
        .addFields(
          { name: 'Role Utama', value: `${role.name}`, inline: true },
          { name: 'Role Tambahan', value: role2 ? `${role2.name}` : '-', inline: true },
          { name: 'Status', value: '🟢 Aktif', inline: true },
        )
        .setFooter({ text: 'Syntax Bot - Verification System' })
        .setTimestamp();

      const verifyBtn = new ButtonBuilder()
        .setCustomId('verify_me')
        .setLabel('Mulai Verifikasi')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

      const row = new ActionRowBuilder().addComponents(verifyBtn);

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `✅ Panel verifikasi terpasang!\n\n**Alur yang akan dijalani member baru:**\n**1️⃣** Klik **Mulai Verifikasi**\n**2️⃣** Isi form (Nama, Jurusan, Semester/Umur, Email, No WA)\n**3️⃣** Baca rules\n**4️⃣** Pilih role di channel role selection\n**5️⃣** Dapat role **${role.name}**${role2 ? ` + **${role2.name}**` : ''}\n\n⚠️ Role akan diberikan di **channel role selection**, bukan setelah isi form.\n⚠️ Jangan lupa set **@everyone** tidak bisa akses channel lain, dan role **${role.name}** yang bisa akses.`,
        ephemeral: true,
      });
    }

    if (sub === 'setrules') {
      const channel = interaction.options.getChannel('channel');
      await db.set(`rulesChannel_${interaction.guild.id}`, channel.id);
      await interaction.reply({ content: `✅ Channel rules diatur ke ${channel}.`, ephemeral: true });
    }

    if (sub === 'setroles') {
      const channel = interaction.options.getChannel('channel');
      await db.set(`rolesChannel_${interaction.guild.id}`, channel.id);

      const verifyRoleId = await db.get(`verifyRole_${interaction.guild.id}`);
      const memsynRoleId = await db.get(`memsynRole_${interaction.guild.id}`);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎭 Pilih Role Kamu')
        .setDescription('Klik tombol di bawah untuk mendapatkan role yang tersedia!')
        .setTimestamp();

      const btnRow = new ActionRowBuilder();
      if (verifyRoleId) {
        const role = interaction.guild.roles.cache.get(verifyRoleId);
        if (role) {
          btnRow.addComponents(
            new ButtonBuilder().setCustomId(`toggle_role_${verifyRoleId}`).setLabel(role.name).setStyle(ButtonStyle.Primary).setEmoji('✅'),
          );
        }
      }
      if (memsynRoleId) {
        const role = interaction.guild.roles.cache.get(memsynRoleId);
        if (role) {
          btnRow.addComponents(
            new ButtonBuilder().setCustomId(`toggle_role_${memsynRoleId}`).setLabel(role.name).setStyle(ButtonStyle.Success).setEmoji('⭐'),
          );
        }
      }

      await channel.send({ embeds: [embed], components: btnRow.components.length ? [btnRow] : [] });
      await interaction.reply({ content: `✅ Channel role selection diatur ke ${channel}. Panel role sudah terkirim!`, ephemeral: true });
    }

    if (sub === 'status') {
      const roleId = await db.get(`verifyRole_${interaction.guild.id}`);
      const memsynId = await db.get(`memsynRole_${interaction.guild.id}`);
      const rulesId = await db.get(`rulesChannel_${interaction.guild.id}`);
      const rolesId = await db.get(`rolesChannel_${interaction.guild.id}`);

      if (!roleId) {
        return interaction.reply({ content: '❌ Verifikasi belum diatur. Gunakan `/verify setup`.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📋 Status Onboarding')
        .addFields(
          { name: '✅ Verifikasi', value: roleId ? `<@&${roleId}>` : '❌', inline: true },
          { name: '➕ Role Tambahan', value: memsynId ? `<@&${memsynId}>` : '-', inline: true },
          { name: '📋 Channel Rules', value: rulesId ? `<#${rulesId}>` : '❌', inline: true },
          { name: '🎭 Channel Roles', value: rolesId ? `<#${rolesId}>` : '❌', inline: true },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
