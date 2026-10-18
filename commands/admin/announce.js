const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement without showing the command user')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Announcement message')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const message = interaction.options.getString('message');

    // Command user-ke kono public message-e show korbe na
    await interaction.reply({
      content: '✅ Announcement sent!',
      ephemeral: true
    });

    // Normal message + hidden @everyone mention
    await interaction.channel.send({
      content: message,
      allowedMentions: {
        parse: ['everyone']
      }
    });
  }
};
