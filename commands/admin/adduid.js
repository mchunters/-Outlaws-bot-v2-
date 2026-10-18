const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');

const MirageUID = require('../../models/MirageUID');
const updateMirageUIDChannel = require('../../functions/updateMirageUIDChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adduid')
    .setDescription('Add a Mirage City UID for a gang member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Discord member')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('uid')
        .setDescription('Mirage City Game UID')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(50)
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
    const uid = interaction.options.getString('uid').trim();

    try {
      await MirageUID.findOneAndUpdate(
        {
          guildId: interaction.guild.id,
          discordUserId: user.id,
        },
        {
          guildId: interaction.guild.id,
          discordUserId: user.id,
          username: user.username,
          gameUid: uid,
          addedBy: interaction.user.id,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      // Update public UID channel
      await updateMirageUIDChannel(
        interaction.client,
        interaction.guild.id
      );

      return interaction.reply({
        content:
          `✅ **Mirage City UID Saved**\n\n` +
          `👤 Member: ${user}\n` +
          `🎮 UID: \`${uid}\`\n\n` +
          `📢 Public UID list updated automatically.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Add UID Error:', error);

      return interaction.reply({
        content: '❌ Failed to save the UID or update the UID channel.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
