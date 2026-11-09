
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');

const TicketSettings = require('../../models/TicketSettings');

const data = new SlashCommandBuilder()
  .setName('ticketsetup')
  .setDescription('Configure the Outlaws ticket system')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

  .addChannelOption(option =>
    option
      .setName('category')
      .setDescription('Category for tickets')
      .addChannelTypes(ChannelType.GuildCategory)
      .setRequired(true)
  )

  .addChannelOption(option =>
    option
      .setName('logs')
      .setDescription('Channel for ticket logs')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )

  .addRoleOption(option =>
    option
      .setName('support_role_1')
      .setDescription('First staff role (required)')
      .setRequired(true)
  );

for (let i = 2; i <= 10; i++) {
  data.addRoleOption(option =>
    option
      .setName(`support_role_${i}`)
      .setDescription(`Additional staff role ${i}`)
      .setRequired(false)
  );
}

data.addIntegerOption(option =>
  option
    .setName('limit')
    .setDescription('Maximum tickets per user')
    .setMinValue(1)
    .setMaxValue(10)
    .setRequired(false)
);

module.exports = {
  data,

  async execute(interaction) {
    if (!interaction.memberPermissions.has(
      PermissionFlagsBits.Administrator
    )) {
      return interaction.reply({
        content: '❌ Administrator permission required!',
        ephemeral: true,
      });
    }

    const category = interaction.options.getChannel('category');
    const logs = interaction.options.getChannel('logs');
    const limit = interaction.options.getInteger('limit') || 3;

    const supportRoleIds = [];

    for (let i = 1; i <= 10; i++) {
      const role = interaction.options.getRole(`support_role_${i}`);

      if (role && !supportRoleIds.includes(role.id)) {
        supportRoleIds.push(role.id);
      }
    }

    if (!supportRoleIds.length) {
      return interaction.reply({
        content: '❌ Select at least one staff role.',
        ephemeral: true,
      });
    }

    try {
      await TicketSettings.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          $set: {
            guildId: interaction.guildId,
            enabled: true,
            categoryId: category.id,
            logChannelId: logs.id,
            supportRoleIds,
            ticketLimit: limit,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      const roleList = supportRoleIds
        .map(id => `<@&${id}>`)
        .join('\n');

      return interaction.reply({
        content:
          `✅ **OUTLAWS TICKET SYSTEM CONFIGURED**\n\n` +
          `📂 Category: ${category}\n` +
          `📋 Log Channel: ${logs}\n` +
          `🛡️ Staff Roles:\n${roleList}\n\n` +
          `🎫 Ticket Limit: ${limit}\n\n` +
          `All selected staff roles now have ticket access.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('Ticket Setup Error:', error);

      return interaction.reply({
        content: '❌ Ticket setup failed. Check Render logs.',
        ephemeral: true,
      });
    }
  },
};
