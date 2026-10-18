const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '../events');
  let count = 0;

  const loadEvents = (dir) => {
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      const stat = fs.lstatSync(filePath);
      if (stat.isDirectory()) {
        loadEvents(filePath);
        continue;
      }
      if (!file.endsWith('.js')) continue;
      const event = require(filePath);
      if (!event || !event.name || typeof event.execute !== 'function') {
        console.warn(`⚠️ Skipped invalid event: ${path.relative(eventsPath, filePath)}`);
        continue;
      }
      const listener = (...args) => event.execute(...args);
      if (event.once) client.once(event.name, listener);
      else client.on(event.name, listener);
      count++;
    }
  };

  loadEvents(eventsPath);
  console.log(`✅ Successfully loaded ${count} events`);
};
