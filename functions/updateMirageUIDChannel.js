const { EmbedBuilder } = require('discord.js');
const MirageUID = require('../models/MirageUID');

const UID_CHANNEL_ID = '1554458478649675836';

async function updateMirageUIDChannel(client, guildId) {
  try {
    const channel = await client.channels.fetch(UID_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      throw new Error('UID channel not found.');
    }

    const members = await MirageUID.find({ guildId })
      .sort({ username: 1 })
      .lean();

    let description =
      `🔐 **Private administrator-only UID records**\n\n` +
      `**Total Members: ${members.length}**\n\n`;

    if (members.length === 0) {
      description += '📭 No UID records found.';
    } else {
      members.forEach((member, index) => {
        description +=
          `**${index + 1}. ${member.username}**\n` +
          `👤 Discord: <@${member.discordUserId}>\n` +
          `🎮 UID: \`${member.gameUid}\`\n\n`;
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x8b0000)
      .setTitle('🏴 OUTLAWS — MIRAGE CITY UID LIST')
      .setDescription(description)
      .setFooter({
        text: 'Outlaws • Mirage City UID Records',
      })
      .setTimestamp();

    // Find old UID list message
    const messages = await channel.messages.fetch({
      limit: 100,
    });

    let uidMessage = messages.find(
      (message) =>
        message.author.id === client.user.id &&
        message.embeds.length > 0 &&
        message.embeds[0].title ===
          '🏴 OUTLAWS — MIRAGE CITY UID LIST'
    );

    // Create message if it doesn't exist
    if (!uidMessage) {
      uidMessage = await channel.send({
        embeds: [embed],
      });

      console.log('✅ UID list message created.');
    } else {
      // Update existing message
      await uidMessage.edit({
        embeds: [embed],
      });

      console.log('✅ UID list message updated.');
    }

    return uidMessage;
  } catch (error) {
    console.error('❌ UID Channel Update Error:', error);
  }
}

module.exports = updateMirageUIDChannel;
