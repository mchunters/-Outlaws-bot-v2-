const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('outlaws')
    .setDescription('Send a normal message to a selected channel')
    .addStringOption((option) =>
      option
        .setName('content')
        .setDescription('The message you want to send')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel where the message will be sent')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const content = interaction.options.getString('content');
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Please select a text channel.',
        ephemeral: true,
      });
    }

    try {
      await channel.send({
        content: content,
        allowedMentions: { parse: [] },
      });

      await interaction.reply({
        content: `✅ Message sent to ${channel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Outlaws command error:', error);

      await interaction.reply({
        content:
          '❌ I could not send the message. Please check my permission in that channel.',
        ephemeral: true,
      });
    }
  },
};
