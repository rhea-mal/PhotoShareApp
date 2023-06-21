const mongoose = require('mongoose');

const { Schema } = mongoose;

const activitySchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    lastActivity: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  });

  const Activity = mongoose.model('Activity', activitySchema);

  module.exports = Activity;

  