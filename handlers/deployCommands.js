require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const token = process.env.DISCORD_TOKEN;

  if (!clientId) {
    console.error('❌ DISCORD_CLIENT_ID is missing in Render Environment.');
    return;
  }

  if (!token) {
    console.error('❌ DISCORD_TOKEN is missing in Render Environment.');
    return;
  }

  const commands = [];

  const commandsPath = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsPath)) {
    console.error('❌ Commands folder not found.');
    return;
  }

  const categories = fs
    .readdirSync(commandsPath)
    .filter((file) =>
      fs.statSync(path.join(commandsPath, file)).isDirectory()
    );

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));

        if (!command.data) {
          console.warn(
            `⚠️ Skipping invalid command: ${category}/${file}`
          );
          continue;
        }

        commands.push(command.data.toJSON());
      } catch (error) {
        console.error(
          `❌ Failed to prepare command: ${category}/${file}`
        );
        console.error(error);
      }
    }
  }

  console.log(`📦 Preparing ${commands.length} slash commands...`);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('🔄 Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      {
        body: commands,
      }
    );

    console.log(
      `✅ Successfully deployed ${commands.length} application commands.`
    );
  } catch (error) {
    console.error('❌ Slash command deployment failed:');
    console.error(error);
  }
};
