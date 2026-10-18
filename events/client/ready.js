const { Events } = require('discord.js');
const startGiveawayScheduler = require('../../functions/giveawayScheduler');
const serverStatusUpdater = require('../../functions/serverStatusUpdater');
const updateStatus = require('../../functions/statusRotation');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Discord client is ready. Starting systems...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ==========================================
    // 🎁 GIVEAWAY SCHEDULER
    // ==========================================
    try {
      startGiveawayScheduler(client);
      console.log('✅ Giveaway scheduler started.');
    } catch (error) {
      console.error('❌ Giveaway scheduler failed:');
      console.error(error);
    }

    // ==========================================
    // 🖥 SERVER STATUS UPDATER
    // ==========================================
    try {
      // Do not allow a database/API problem to stop
      // the rest of the bot startup.
      await serverStatusUpdater(client);
      console.log('✅ Server status updater started.');
    } catch (error) {
      console.error('❌ Server status updater failed:');
      console.error(error);
    }

    // ==========================================
    // 🟢 BOT STATUS ROTATION
    // ==========================================
    try {
      updateStatus(client);
      console.log('✅ Status rotation started.');
    } catch (error) {
      console.error('❌ Status rotation failed:');
      console.error(error);
    }

    // ==========================================
    // ⚔️ OUTLAWS WAR SYSTEM
    // ==========================================
    try {
      const { getWarPanel } = require('../../functions/warSystem');

      await getWarPanel(client);

      console.log('✅ Outlaws War System initialized.');
    } catch (error) {
      console.error('❌ Outlaws War System failed to initialize.');
      console.error(error);

      // IMPORTANT:
      // War panel failure must NOT take the bot offline.
    }

    // ==========================================
    // 📂 COMMAND CATEGORY INFORMATION
    // ==========================================
    try {
      const commandFolderPath = path.join(
        __dirname,
        '../../commands'
      );

      if (fs.existsSync(commandFolderPath)) {
        const categories = fs
          .readdirSync(commandFolderPath)
          .filter((file) =>
            fs.statSync(
              path.join(commandFolderPath, file)
            ).isDirectory()
          );

        let categoryText =
          `${global.styles.accentColor('📂 Categories:')}\n`;

        categories.forEach((category) => {
          categoryText +=
            `    ${global.styles.primaryColor('🔸')} ` +
            `${global.styles.commandColor(category)}\n`;
        });

        console.log(`\n${categoryText}`);
      } else {
        console.log('⚠️ Commands folder not found.');
      }
    } catch (error) {
      console.error('❌ Could not read command categories:');
      console.error(error);
    }

    // ==========================================
    // 📊 BOT INFORMATION
    // ==========================================
    try {
      const startTime = new Date().toLocaleString();

      const memoryUsage = (
        process.memoryUsage().heapUsed /
        1024 /
        1024
      ).toFixed(2);

      const serverCount = client.guilds.cache.size;

      const userCount = client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      const divider = global.styles.dividerColor(
        '═══════════════════════════════════════════════════════════════'
      );

      console.log(`\n${divider}`);

      console.log(
        `${global.styles.infoColor('🤖 Bot User       :')} ` +
        `${global.styles.userColor(client.user.tag)}`
      );

      console.log(
        `${global.styles.infoColor('🌍 Servers        :')} ` +
        `${global.styles.accentColor(serverCount)}`
      );

      console.log(
        `${global.styles.infoColor('👥 Total Users    :')} ` +
        `${global.styles.successColor(userCount)}`
      );

      console.log(
        `${global.styles.infoColor('📡 Status         :')} ` +
        `${global.styles.successColor('Online 🟢')}`
      );

      console.log(
        `${global.styles.infoColor('⏰ Started At     :')} ` +
        `${global.styles.secondaryColor(startTime)}`
      );

      console.log(
        `${global.styles.infoColor('📦 Version        :')} ` +
        `${global.styles.secondaryColor('v1.0.0')}`
      );

      console.log(
        `${global.styles.infoColor('🔧 Node.js        :')} ` +
        `${global.styles.highlightColor(process.version)}`
      );

      console.log(
        `${global.styles.infoColor('💾 Memory Usage   :')} ` +
        `${global.styles.errorColor(`${memoryUsage} MB`)}`
      );

      console.log(`${divider}`);

      console.log(
        `${global.styles.successColor('\n🚀 BOT IS READY! 🚀')}`
      );

      console.log(`${divider}\n`);
    } catch (error) {
      console.error('❌ Error displaying ready information:');
      console.error(error);
    }
  },
};
