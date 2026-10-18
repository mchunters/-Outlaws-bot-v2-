const express = require('express');
const app = express();

require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
} = require('discord.js');


const fs = require('fs');
const path = require('path');
const chalk = require('chalk');


// ==========================================
// 🌐 RENDER WEB SERVER
// ==========================================

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.status(200).send('Everything is up!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Express server running on port ${PORT}`);
});

// ==========================================
// 🔐 ENV CHECK
// ==========================================

const requiredEnv = [
  'DISCORD_TOKEN',
  'DISCORD_CLIENT_ID',
];

const missingEnv = requiredEnv.filter(
  (name) => !process.env[name]
);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missingEnv.join(', ')}`
  );

  process.exit(1);
}

// ==========================================
// 🤖 DISCORD CLIENT
// ==========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],

  partials: [
    Partials.Channel,
  ],
});

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = {
  successColor: chalk.bold.green,
  warningColor: chalk.bold.yellow,
  infoColor: chalk.bold.blue,
  commandColor: chalk.bold.cyan,
  userColor: chalk.bold.magenta,
  errorColor: chalk.red,
  highlightColor: chalk.bold.hex('#FFA500'),
  accentColor: chalk.bold.hex('#00FF7F'),
  secondaryColor: chalk.hex('#ADD8E6'),
  primaryColor: chalk.bold.hex('#FF1493'),
  dividerColor: chalk.hex('#FFD700'),
};

global.styles = styles;

// ==========================================
// 🔍 DISCORD GATEWAY DEBUG
// ==========================================

client.on('debug', (message) => {
  console.log(`🔎 Discord Debug: ${message}`);
});

client.on('ready', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🟢 DISCORD READY EVENT RECEIVED');
  console.log(`🤖 Logged in as: ${client.user.tag}`);
  console.log(`🌍 Servers: ${client.guilds.cache.size}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

client.on('shardReady', (shardId) => {
  console.log(
    `🟢 DISCORD SHARD READY | Shard: ${shardId}`
  );
});

client.on('shardReconnecting', (shardId) => {
  console.warn(
    `🔄 DISCORD SHARD RECONNECTING | Shard: ${shardId}`
  );
});

client.on('shardDisconnect', (event, shardId) => {
  console.error(
    `🔴 DISCORD SHARD DISCONNECTED | Shard: ${shardId}`
  );

  console.error(event);
});

client.on('shardError', (error, shardId) => {
  console.error(
    `❌ DISCORD SHARD ERROR | Shard: ${shardId}`
  );

  console.error(error);
});

client.on('error', (error) => {
  console.error('❌ DISCORD CLIENT ERROR:');
  console.error(error);
});

client.on('warn', (warning) => {
  console.warn('⚠️ DISCORD WARNING:');
  console.warn(warning);
});

client.on('invalidated', () => {
  console.error(
    '❌ DISCORD SESSION INVALIDATED.'
  );
});

// ==========================================
// 🧩 LOAD HANDLERS
// ==========================================

try {
  const handlersPath = path.join(
    __dirname,
    'handlers'
  );

  const handlerFiles = fs
    .readdirSync(handlersPath)
    .filter((file) => file.endsWith('.js'));

  let counter = 0;

  for (const file of handlerFiles) {
    try {
      const handler = require(
        path.join(handlersPath, file)
      );

      if (typeof handler === 'function') {
        handler(client);

        counter++;

        console.log(
          `✅ Handler loaded: ${file}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to load handler: ${file}`
      );

      console.error(error);
    }
  }

  console.log(
    `✅ Successfully loaded ${counter} handlers`
  );
} catch (error) {
  console.error(
    '❌ Handler system failed:',
    error
  );

  process.exit(1);
}

// ==========================================
// 📩 DM LOG SYSTEM
// ==========================================

const DM_LOG_CHANNEL_ID =
  '1556254987712200824';

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    if (message.channel.type !== 1) return;

    const logChannel =
      await client.channels.fetch(
        DM_LOG_CHANNEL_ID
      );

    if (!logChannel) return;

    await logChannel.send(
      `📩 **New DM Received**\n\n` +
      `👤 **User:** ${message.author.tag}\n` +
      `🆔 **User:** <@${message.author.id}>\n` +
      `💬 **Message:** ${
        message.content || '*No text message*'
      }`
    );

    console.log(
      `📩 DM received from ${message.author.tag}`
    );
  } catch (error) {
    console.error(
      '❌ DM Log Error:',
      error
    );
  }
});

// ==========================================
// 🚀 DISCORD LOGIN
// ==========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 Connecting to Discord Gateway...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let loginFinished = false;

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => {
    loginFinished = true;

    console.log(
      '✅ Discord login request completed.'
    );
  })
  .catch((error) => {
    loginFinished = true;

    console.error(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    console.error(
      '❌ DISCORD LOGIN FAILED'
    );

    console.error(error);

    console.error(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    process.exit(1);
  });

// ==========================================
// ⏱️ DISCORD CONNECTION WATCHDOG
// ==========================================

setTimeout(() => {
  if (!client.isReady()) {
    console.error(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    console.error(
      '🚨 DISCORD GATEWAY TIMEOUT'
    );

    console.error(
      'Bot has not reached READY state.'
    );

    console.error(
      `Login promise finished: ${loginFinished}`
    );

    console.error(
      'Check Discord token, Gateway connection, intents and Discord API connectivity.'
    );

    console.error(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    try {
      client.destroy();
    } catch (error) {
      console.error(error);
    }

    process.exit(1);
  }
}, 30000);

// ==========================================
// 🛑 PROCESS ERRORS
// ==========================================

process.on('unhandledRejection', (error) => {
  console.error(
    '❌ UNHANDLED PROMISE REJECTION:'
  );

  console.error(error);
});

process.on('uncaughtException', (error) => {
  console.error(
    '❌ UNCAUGHT EXCEPTION:'
  );

  console.error(error);

  process.exit(1);
});

// ==========================================
// 🛑 SHUTDOWN
// ==========================================

const shutdown = (signal) => {
  console.log(
    `🛑 ${signal} received. Shutting down...`
  );

  try {
    client.destroy();
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
