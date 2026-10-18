const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');

const MirageUID = require('../../models/MirageUID');
const updateMirageUIDChannel = require('../../functions/updateMirageUIDChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeuid')
    .setDescription('Remove a Mirage City UID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Discord member')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (
      !interaction.memberPermissions.has(
        PermissionFlagsBits.Administrator
      )
    ) {
      return interaction.reply({
        content: '❌ Only Administrators can use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser('user');

    try {
      const deleted = await MirageUID.findOneAndDelete({
        guildId: interaction.guild.id,
        discordUserId: user.id,
      });

      if (!deleted) {
        return interaction.reply({
          content: `❌ No UID found for ${user}.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Update public UID channel
      await updateMirageUIDChannel(
        interaction.client,
        interaction.guild.id
      );

      return interaction.reply({
        content:
          `✅ UID removed successfully.\n` +
          `👤 Member: ${user}\n\n` +
          `📢 Public UID list updated automatically.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Remove UID Error:', error);

      return interaction.reply({
        content: '❌ Failed to remove the UID.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
