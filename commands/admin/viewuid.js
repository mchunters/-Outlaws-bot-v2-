const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');

const MirageUID = require('../../models/MirageUID');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewuid')
    .setDescription('View a member\'s Mirage City UID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Discord member')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Only Administrators can use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser('user');

    try {
      const data = await MirageUID.findOne({
        guildId: interaction.guild.id,
        discordUserId: user.id,
      });

      if (!data) {
        return interaction.reply({
          content: `❌ No Mirage City UID found for ${user}.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      return interaction.reply({
        content:
          `🔐 **Mirage City UID Information**\n\n` +
          `👤 Member: ${user}\n` +
          `🆔 Discord ID: \`${data.discordUserId}\`\n` +
          `🎮 Mirage City UID: \`${data.gameUid}\``,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('View UID Error:', error);

      return interaction.reply({
        content: '❌ Failed to retrieve the UID.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
