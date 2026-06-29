const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../utils/database');

async function handleVerifyButton(interaction) {
  const verifyRoleId = await db.get(`verifyRole_${interaction.guild.id}`);
  if (!verifyRoleId) {
    return interaction.reply({ content: '❌ Role verifikasi belum diatur oleh admin.', ephemeral: true });
  }

  const member = interaction.member;
  if (member.roles.cache.has(verifyRoleId)) {
    return interaction.reply({ content: '✅ Kamu sudah terverifikasi!', ephemeral: true });
  }

  const progress = await db.get(`progress_${interaction.guild.id}_${interaction.user.id}`);
  if (progress?.formDone && !progress?.rulesDone) {
    return interaction.reply({ content: '📋 Kamu sudah isi form. Silakan lanjut ke **#rules** dengan klik tombol yang sudah dikirim sebelumnya.', ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId('verify_modal')
    .setTitle('📋 Form Verifikasi');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('v_nama').setLabel('Nama Lengkap').setStyle(TextInputStyle.Short).setPlaceholder('Masukkan nama lengkap').setRequired(true).setMaxLength(100),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('v_jurusan').setLabel('Jurusan/Prodi').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: Informatika, Sistem Informasi').setRequired(true).setMaxLength(100),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('v_semester_umur').setLabel('Semester & Umur').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: Semester 4, 20 tahun').setRequired(true).setMaxLength(50),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('v_email').setLabel('Email Aktif').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: nama@gmail.com').setRequired(true).setMaxLength(100),
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('v_wa').setLabel('Nomor WhatsApp').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: 081234567890').setRequired(true).setMaxLength(20),
    ),
  );

  await interaction.showModal(modal);
}

async function handleVerifyModal(interaction) {
  const verifyRoleId = await db.get(`verifyRole_${interaction.guild.id}`);
  const rulesChannelId = await db.get(`rulesChannel_${interaction.guild.id}`);

  if (!verifyRoleId) {
    return interaction.reply({ content: '❌ Sistem verifikasi belum diatur.', ephemeral: true });
  }

  const nama = interaction.fields.getTextInputValue('v_nama');
  const jurusan = interaction.fields.getTextInputValue('v_jurusan');
  const semesterUmur = interaction.fields.getTextInputValue('v_semester_umur');
  const email = interaction.fields.getTextInputValue('v_email');
  const wa = interaction.fields.getTextInputValue('v_wa');

  await db.set(`memberData_${interaction.guild.id}_${interaction.user.id}`, { nama, jurusan, semesterUmur, email, wa, verifiedAt: Date.now() });
  await db.set(`progress_${interaction.guild.id}_${interaction.user.id}`, { formDone: true, rulesDone: false });

  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('✅ Data Tersimpan')
    .setDescription(`Terima kasih **${interaction.user.username}**, data kamu sudah tersimpan!`)
    .addFields(
      { name: 'Nama', value: nama, inline: true },
      { name: 'Jurusan', value: jurusan, inline: true },
      { name: 'Semester/Umur', value: semesterUmur, inline: true },
      { name: 'Email', value: email, inline: true },
      { name: 'No. WA', value: wa, inline: true },
    )
    .setFooter({ text: 'Langkah selanjutnya: Baca peraturan server' })
    .setTimestamp();

  const components = [];
  if (rulesChannelId) {
    const btnRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('go_rules').setLabel('📋 Lanjut ke Rules').setStyle(ButtonStyle.Primary),
    );
    components.push(btnRow);
  }

  await interaction.reply({ embeds: [embed], components, ephemeral: true });
}

async function handleGoRules(interaction) {
  const rulesChannelId = await db.get(`rulesChannel_${interaction.guild.id}`);
  if (!rulesChannelId) {
    return interaction.reply({ content: '❌ Channel rules belum diatur oleh admin.', ephemeral: true });
  }

  const rulesChannel = interaction.guild.channels.cache.get(rulesChannelId);
  if (!rulesChannel) {
    return interaction.reply({ content: '❌ Channel rules tidak ditemukan.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('📋 Peraturan Server')
    .setDescription(`Halo ${interaction.user}, silakan baca peraturan server dengan seksama:\n\n` +
      `**1.** Saling menghargai, jangan saling menjatuhkan atau bikin ribut.\n` +
      `**2.** Gunakan channel sesuai fungsinya.\n` +
      `**3.** Dilarang spam, flood, atau promosi tanpa izin.\n` +
      `**4.** Jaga sopan santun saat berdiskusi, beda pendapat itu wajar.\n` +
      `**5.** Jangan menyebarkan konten yang melanggar aturan atau merugikan orang lain.\n` +
      `**6.** Soal pinjam meminjam atau urusan uang, pikirkan baik-baik sebelum melakukannya. Semua risiko dan tanggung jawab ada di pihak yang bersangkutan, bukan pengurus atau komunitas.\n` +
      `**7.** Ikuti arahan admin dan moderator demi kenyamanan bersama.\n\n` +
      `Setelah selesai membaca, klik tombol di bawah untuk melanjutkan ke pemilihan role.`)
    .setTimestamp();

  const btn = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('rules_done').setLabel('✅ Saya sudah membaca Rules').setStyle(ButtonStyle.Success),
  );

  await rulesChannel.send({ embeds: [embed], components: [btn] });
  await interaction.reply({
    content: `📋 **Langkah selanjutnya:**\n1️⃣ Klik atau buka channel ${rulesChannel} (biru di atas)\n2️⃣ Baca peraturan di sana\n3️⃣ Klik tombol **✅ Saya sudah membaca Rules**\n\n*Kamu harus pindah ke channel tersebut secara manual, bot tidak bisa memindahkanmu.*`,
    ephemeral: true,
  });
}

async function handleRulesDone(interaction) {
  await db.set(`progress_${interaction.guild.id}_${interaction.user.id}`, { formDone: true, rulesDone: true });

  const rolesChannelId = await db.get(`rolesChannel_${interaction.guild.id}`);

  if (!rolesChannelId) {
    return interaction.reply({ content: '❌ Channel role selection belum diatur oleh admin.', ephemeral: true });
  }

  const rolesChannel = interaction.guild.channels.cache.get(rolesChannelId);
  if (!rolesChannel) {
    return interaction.reply({ content: '❌ Channel role selection tidak ditemukan.', ephemeral: true });
  }

  await rolesChannel.send({ content: `${interaction.user}`, embeds: [
    new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎭 Pilih Role Kamu')
      .setDescription(`Halo ${interaction.user}, klik tombol role di bawah untuk mendapatkannya!`)
      .setTimestamp(),
  ]});

  await interaction.reply({
    content: `✅ **Langkah selanjutnya:**\n1️⃣ Klik atau buka channel ${rolesChannel} (biru di atas)\n2️⃣ Klik tombol role yang kamu inginkan\n3️⃣ Role langsung diberikan!\n\n*Kamu harus pindah ke channel tersebut secara manual.*`,
    ephemeral: true,
  });
}

async function handleRoleToggle(interaction, roleId) {
  const progress = await db.get(`progress_${interaction.guild.id}_${interaction.user.id}`);
  if (!progress || !progress.formDone || !progress.rulesDone) {
    return interaction.reply({
      content: `❌ Kamu belum menyelesaikan onboarding!\n📝 Isi form dulu: klik **Mulai Verifikasi**\n📋 Baca rules setelah itu\n\nBaru bisa pilih role setelah kedua langkah selesai.`,
      ephemeral: true,
    });
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    return interaction.reply({ content: '❌ Role tidak ditemukan.', ephemeral: true });
  }

  if (interaction.member.roles.cache.has(roleId)) {
    await interaction.member.roles.remove(role);
    await interaction.reply({ content: `❌ Role **${role.name}** telah dihapus dari kamu.`, ephemeral: true });
  } else {
    await interaction.member.roles.add(role);
    await interaction.reply({
      content: `✅ Kamu mendapatkan role **${role.name}**!\n\n` +
        `🎉 **Selamat!** Kamu sudah resmi menjadi bagian dari **${interaction.guild.name}**!\n` +
        `✅ Semua server dan informasi berharga sudah bisa kamu akses.\n\n` +
        `**Selamat berjuang!** 💪\n*DYOR — Do Your Own Research*`,
      ephemeral: true,
    });
  }
}

async function handleTicketButtons(interaction, client) {
  if (interaction.customId === 'create_ticket') {
    const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
    if (existing) {
      return interaction.reply({ content: `❌ Kamu sudah punya ticket: ${existing}`, ephemeral: true });
    }

    const categoryId = process.env.TICKET_CATEGORY_ID;
    const category = interaction.guild.channels.cache.get(categoryId);

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category || null,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
      ],
    });

    await db.set(`ticket_${ticketChannel.id}`, interaction.user.id);

    const closeBtn = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Tutup Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    const closeRow = new ActionRowBuilder().addComponents(closeBtn);

    const ticketEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🎫 Ticket Support')
      .setDescription(`Halo ${interaction.user}, tim support akan segera membantu kamu.`);

    await ticketChannel.send({ content: `${interaction.user}`, embeds: [ticketEmbed], components: [closeRow] });
    await interaction.reply({ content: `✅ Ticket dibuat: ${ticketChannel}`, ephemeral: true });
  }

  if (interaction.customId === 'close_ticket') {
    if (!interaction.channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Ini bukan channel ticket.', ephemeral: true });
    }

    const ownerId = await db.get(`ticket_${interaction.channel.id}`);
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    if (interaction.user.id !== ownerId && !isAdmin) {
      return interaction.reply({ content: '❌ Hanya pembuat ticket atau admin yang bisa menutup.', ephemeral: true });
    }

    await interaction.reply({ content: '🔒 Ticket akan ditutup dalam 5 detik...' });
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle modals
    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
      return handleVerifyModal(interaction);
    }

    // Handle buttons
    if (interaction.isButton()) {
      if (interaction.customId === 'verify_me') return handleVerifyButton(interaction);
      if (interaction.customId === 'go_rules') return handleGoRules(interaction);
      if (interaction.customId === 'rules_done') return handleRulesDone(interaction);
      if (interaction.customId === 'create_ticket' || interaction.customId === 'close_ticket') return handleTicketButtons(interaction, client);
      if (interaction.customId.startsWith('toggle_role_')) {
        const roleId = interaction.customId.replace('toggle_role_', '');
        return handleRoleToggle(interaction, roleId);
      }
      return;
    }

    // Handle slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`[ERROR] ${interaction.commandName}:`, error);
      const reply = { content: 'Terjadi kesalahan saat menjalankan perintah.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  },
};
