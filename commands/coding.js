const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coding')
    .setDescription('Belajar coding dasar')
    .addStringOption(opt =>
      opt.setName('bahasa')
        .setDescription('Pilih bahasa')
        .setRequired(true)
        .addChoices(
          { name: 'C++', value: 'cpp' },
          { name: 'JavaScript', value: 'javascript' },
        ))
    .addIntegerOption(opt =>
      opt.setName('nomor')
        .setDescription('Nomor materi (1-10)')
        .setRequired(false)),

  async execute(interaction) {
    const bahasa = interaction.options.getString('bahasa');
    const nomor = interaction.options.getInteger('nomor');
    const lessons = config.codingBasics[bahasa];

    if (nomor) {
      if (nomor < 1 || nomor > lessons.length) {
        return interaction.reply({ content: `❌ Nomor harus 1-${lessons.length}.`, ephemeral: true });
      }
      const lesson = lessons[nomor - 1];
      const embed = new EmbedBuilder()
        .setColor(bahasa === 'cpp' ? 0x659BD2 : 0xF7DF1E)
        .setTitle(`📘 ${lesson.title}`)
        .setDescription(`\`\`\`${bahasa === 'cpp' ? 'cpp' : 'javascript'}\n${lesson.code}\n\`\`\``)
        .setFooter({ text: `Gunakan /coding ${bahasa} untuk daftar materi` });

      return interaction.reply({ embeds: [embed] });
    }

    let desc = '';
    for (let i = 0; i < lessons.length; i++) {
      desc += `**${i + 1}.** ${lessons[i].title}\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(bahasa === 'cpp' ? 0x659BD2 : 0xF7DF1E)
      .setTitle(`📚 Daftar Materi ${bahasa === 'cpp' ? 'C++' : 'JavaScript'}`)
      .setDescription(desc)
      .setFooter({ text: `Gunakan /coding ${bahasa} nomor:1 untuk melihat materi` });

    await interaction.reply({ embeds: [embed] });
  },
};
