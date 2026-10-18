const { Events, MessageFlags } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction) {
    try {
      // ===============================
      // SLASH COMMANDS
      // ===============================
      if (interaction.isChatInputCommand()) {
        console.log(
          `📥 Slash command received: /${interaction.commandName} | User: ${interaction.user.tag}`
        );

        const command = interaction.client.commands.get(
          interaction.commandName
        );

        // Command not found
        if (!command) {
          console.error(
            `❌ Command not found in client.commands: /${interaction.commandName}`
          );

          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content:
                `❌ Command \`/${interaction.commandName}\` is not loaded by the bot.`,
              flags: MessageFlags.Ephemeral,
            });
          }

          return;
        }

        console.log(
          `⚙️ Executing command: /${interaction.commandName}`
        );

        await command.execute(interaction);

        console.log(
          `✅ Command completed: /${interaction.commandName}`
        );

        return;
      }

      // ===============================
      // AUTOCOMPLETE
      // ===============================
      if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(
          interaction.commandName
        );

        if (!command || !command.autocomplete) {
          return;
        }

        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error(
            `❌ Autocomplete error for /${interaction.commandName}:`,
            error
          );

          if (!interaction.responded) {
            await interaction.respond([]);
          }
        }

        return;
      }

      // ===============================
      // BUTTONS
      // ===============================
      if (interaction.isButton()) {
        console.log(
          `🔘 Button clicked: ${interaction.customId} | User: ${interaction.user.tag}`
        );

        return;
      }

      // ===============================
      // MODALS
      // ===============================
      if (interaction.isModalSubmit()) {
        console.log(
          `📝 Modal submitted: ${interaction.customId} | User: ${interaction.user.tag}`
        );

        return;
      }

      // ===============================
      // SELECT MENUS
      // ===============================
      if (interaction.isStringSelectMenu()) {
        console.log(
          `📋 Select menu used: ${interaction.customId} | User: ${interaction.user.tag}`
        );

        return;
      }
    } catch (error) {
      console.error('❌ Interaction error:', error);

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content:
              '❌ There was an error while executing this interaction.',
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content:
              '❌ There was an error while executing this interaction.',
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch (replyError) {
        console.error(
          '❌ Could not send interaction error response:',
          replyError
        );
      }
    }
  },
};
