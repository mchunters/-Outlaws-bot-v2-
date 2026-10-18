const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsPath)) {
    console.error('❌ Commands folder not found!');
    return;
  }

  let commandCount = 0;
  let categoryCount = 0;

  const categories = fs
    .readdirSync(commandsPath)
    .filter((file) => {
      return fs.statSync(path.join(commandsPath, file)).isDirectory();
    });

  categoryCount = categories.length;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
          console.warn(`⚠️ Skipped invalid command: ${category}/${file}`);
          continue;
        }

        const commandName = command.data.name;

        if (client.commands.has(commandName)) {
          console.warn(`⚠️ Duplicate command: /${commandName}`);
          continue;
        }

        client.commands.set(commandName, {
          ...command,
          category,
        });

        commandCount++;
      } catch (error) {
        console.error(
          `❌ Failed to load command: ${category}/${file}`
        );
        console.error(error);
      }
    }
  }

  console.log(
    global.styles.successColor(
      `✅ Loaded ${commandCount} commands across ${categoryCount} categories`
    )
  );

  console.log(
    global.styles.infoColor(
      `📋 Registered commands: ${[...client.commands.keys()]
        .map((name) => `/${name}`)
        .join(', ')}`
    )
  );
};
