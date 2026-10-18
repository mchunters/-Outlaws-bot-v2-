const mongoose = require('mongoose');

const MirageUIDSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    discordUserId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    gameUid: {
      type: String,
      required: true,
    },

    addedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

MirageUIDSchema.index(
  { guildId: 1, discordUserId: 1 },
  { unique: true }
);

module.exports = mongoose.model('MirageUID', MirageUIDSchema);
