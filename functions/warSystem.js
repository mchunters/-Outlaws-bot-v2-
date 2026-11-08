const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require('discord.js');
const MirageUID = require('../models/MirageUID');

// ===============================
// OUTLAWS WAR SYSTEM CONFIG
// ===============================
const WAR_PANEL_CHANNEL_ID = '1556392634593972234';
const ANNOUNCEMENT_CHANNEL_ID = '1547928222711152761';
const WAR_VC_CATEGORY_ID = '1547829452858331216';
const WAR_VC_NAME = '🔴・OUTLAWS WAR';

const START_ROLE_IDS = [
  '1547791040243830844', // Outlaws
  '1547792026471243837', // Moderator
  '1547791289465184256', // Co-leader
  '1547499535365050398', // Leader
  '1547941486442717255', // Founder
];

const END_ROLE_IDS = [
  '1547792026471243837', // Moderator
  '1547791289465184256', // Co-leader
  '1547499535365050398', // Leader
  '1547941486442717255', // Founder
];

function hasAnyRole(member, roleIds) {
  return roleIds.some((roleId) => member?.roles?.cache?.has(roleId));
}

function startRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('outlaws-war-start')
      .setLabel('START WAR')
      .setEmoji('🟢')
      .setStyle(ButtonStyle.Success)
  );
}

function endRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('outlaws-war-end')
      .setLabel('END WAR')
      .setEmoji('🛑')
      .setStyle(ButtonStyle.Danger)
  );
}

async function findPanelMessage(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  return messages.find((message) =>
    message.author.id === channel.client.user.id &&
    message.embeds.some((embed) => embed.title === '⚔️ OUTLAWS WAR SYSTEM')
  ) || null;
}

function panelEmbed(active = false) {
  if (active) {
    return new EmbedBuilder()
      .setTitle('⚔️ OUTLAWS WAR SYSTEM')
      .setDescription(
        '**🔴 WAR STATUS: ACTIVE**\n\n' +
        'The Outlaws are currently in an active war.\n\n' +
        '🔥 All members should join the War VC and follow instructions.\n\n' +
        '**Only Leader, Co-Leader, Founder, and Moderator can end the war.**'
      )
      .setColor(0xff0000);
  }

  return new EmbedBuilder()
    .setTitle('⚔️ OUTLAWS WAR SYSTEM')
    .setDescription(
      '**🟢 WAR STATUS: READY**\n\n' +
      'Ready to declare a war? Tap **🟢 START WAR**.\n\n' +
      '✅ No form is required.\n' +
      '🎮 Your saved Game UID will be included automatically.\n' +
      '⚠️ A registered UID is required to start a war.\n\n' +
      '⚔️ **Start War:** Outlaws, Leader, Co-Leader, Founder, Moderator\n' +
      '🛑 **End War:** Leader, Co-Leader, Founder, Moderator\n\n' +
      '**Stay alert. Follow orders. Fight together.**'
    )
    .setColor(0x00ff66);
}

function findWarVoiceChannel(guild) {
  return guild.channels.cache.find(
    (channel) => channel.name === WAR_VC_NAME && channel.type === ChannelType.GuildVoice
  ) || null;
}

async function getWarPanel(client) {
  const channel = await client.channels.fetch(WAR_PANEL_CHANNEL_ID);
  if (!channel?.isTextBased()) {
    console.error('❌ War panel channel not found or is not a text channel.');
    return null;
  }

  const activeWar = Boolean(findWarVoiceChannel(channel.guild));
  let panelMessage = await findPanelMessage(channel);

  if (!panelMessage) {
    panelMessage = await channel.send({
      embeds: [panelEmbed(activeWar)],
      components: [activeWar ? endRow() : startRow()],
    });
    console.log('✅ Outlaws War panel created.');
    return panelMessage;
  }

  await panelMessage.edit({
    embeds: [panelEmbed(activeWar)],
    components: [activeWar ? endRow() : startRow()],
  });
  console.log('✅ Outlaws War panel updated.');
  return panelMessage;
}

async function setPanelState(client, active) {
  const channel = await client.channels.fetch(WAR_PANEL_CHANNEL_ID);
  if (!channel?.isTextBased()) throw new Error('War panel channel is unavailable.');

  const panelMessage = await findPanelMessage(channel);
  const payload = {
    embeds: [panelEmbed(active)],
    components: [active ? endRow() : startRow()],
  };

  if (panelMessage) return panelMessage.edit(payload);
  return channel.send(payload);
}

async function handleWarButton(interaction) {
  if (!['outlaws-war-start', 'outlaws-war-end'].includes(interaction.customId)) return false;

  // Acknowledge immediately so Discord does not show "application didn't respond".
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply('❌ This war button can only be used inside the Outlaws server.');
    return true;
  }

  const member = await guild.members.fetch(interaction.user.id);

  if (interaction.customId === 'outlaws-war-start') {
    if (!hasAnyRole(member, START_ROLE_IDS)) {
      await interaction.editReply('❌ You do not have permission to start an Outlaws war.');
      return true;
    }

    const existingWar = findWarVoiceChannel(guild);
    if (existingWar) {
      await setPanelState(interaction.client, true);
      await interaction.editReply('⚠️ A war is already active. Please use the existing War VC.');
      return true;
    }

    const uidRecord = await MirageUID.findOne({
      guildId: guild.id,
      discordUserId: interaction.user.id,
    }).lean();

    if (!uidRecord?.gameUid) {
      await interaction.editReply(
        '❌ You are not registered as an Outlaws member. Please create a ticket and contact the Leader or Co-Leader to get your Game UID added.'
      );
      return true;
    }

    const category = await guild.channels.fetch(WAR_VC_CATEGORY_ID);
    if (!category || category.type !== ChannelType.GuildCategory) {
      throw new Error(`War VC category ${WAR_VC_CATEGORY_ID} was not found or is not a category.`);
    }

    const voiceChannel = await guild.channels.create({
      name: WAR_VC_NAME,
      type: ChannelType.GuildVoice,
      parent: WAR_VC_CATEGORY_ID,
      reason: `Outlaws war started by ${interaction.user.tag}`,
    });

    try {
      const announcementChannel = await interaction.client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
      if (!announcementChannel?.isTextBased()) {
        throw new Error('War announcement channel is unavailable.');
      }

      await announcementChannel.send({
        content:
          `@everyone ⚔️ **OUTLAWS WAR HAS STARTED!**\n\n` +
          `👤 **Started by:** ${interaction.user}\n` +
          `🎮 **Registered Game UID:** \`${uidRecord.gameUid}\`\n` +
          `🔊 **Join War VC:** ${voiceChannel}\n\n` +
          '**Stay alert. Follow orders. Fight together.**',
        allowedMentions: { parse: ['everyone'], users: [interaction.user.id] },
      });

      await setPanelState(interaction.client, true);
    } catch (error) {
      // Do not leave a misleading active war if announcement/panel setup fails.
      await voiceChannel.delete('Rolling back incomplete Outlaws war start').catch(() => {});
      throw error;
    }

    await interaction.editReply('✅ War started successfully. The announcement has been sent and the War VC is ready.');
    return true;
  }

  if (!hasAnyRole(member, END_ROLE_IDS)) {
    await interaction.editReply('❌ You do not have permission to end an Outlaws war.');
    return true;
  }

  const activeVoice = findWarVoiceChannel(guild);
  if (!activeVoice) {
    await setPanelState(interaction.client, false);
    await interaction.editReply('⚠️ There is no active war to end.');
    return true;
  }

  await activeVoice.delete(`Outlaws war ended by ${interaction.user.tag}`);

  const announcementChannel = await interaction.client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
  if (announcementChannel?.isTextBased()) {
    await announcementChannel.send({
      content: `🛑 **OUTLAWS WAR HAS ENDED!**\n\n👤 **Ended by:** ${interaction.user}\n\nStand down and wait for further orders.`,
      allowedMentions: { users: [interaction.user.id] },
    });
  }

  await setPanelState(interaction.client, false);
  await interaction.editReply('✅ War ended successfully. The War VC has been removed.');
  return true;
}

module.exports = {
  ANNOUNCEMENT_CHANNEL_ID,
  WAR_VC_NAME,
  WAR_VC_CATEGORY_ID,
  START_ROLE_IDS,
  END_ROLE_IDS,
  hasAnyRole,
  getWarPanel,
  setPanelState,
  handleWarButton,
};
