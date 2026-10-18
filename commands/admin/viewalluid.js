const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const MirageUID = require('../../models/MirageUID');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewalluid')
    .setDescription('View all saved Mirage City UIDs.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Only Administrators can use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const users = await MirageUID.find({
        guildId: interaction.guild.id,
      }).sort({ createdAt: 1 });

      if (!users.length) {
        return interaction.reply({
          content: '📭 No Mirage City UIDs have been added yet.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🏴 OUTLAWS — MIRAGE CITY UID LIST')
        .setDescription(
          `🔐 Private administrator-only UID records\n\n` +
          `Total Members: **${users.length}**`
        )
        .setColor('#8E44AD')
        .setTimestamp();

      users.slice(0, 25).forEach((data, index) => {
        embed.addFields({
          name: `${index + 1}. ${data.username}`,
          value:
            `👤 Discord: <@${data.discordUserId}>\n` +
            `🎮 UID: \`${data.gameUid}\``,
          inline: false,
        });
      });

      if (users.length > 25) {
        embed.setFooter({
          text: `Showing 25 of ${users.length} members`,
        });
      }

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('View All UID Error:', error);

      return interaction.reply({
        content: '❌ Failed to retrieve UID list.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
