const mongoose = require("mongoose");

const stationsSchema = new mongoose.Schema({
  stationId: String,
  stationName: String,
  optionNumber: Number,
});

const sessionDataSchema = new mongoose.Schema({
  previousText: String,
  previousInstructionSet: {
    type: Array,
  },
  stations: [stationsSchema],
});

const userSessionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },

  sessionId: {
    type: String,
    required: true,
  },

  sessionData: sessionDataSchema,

  created_date: {
    type: Date,
    default: Date.now,
  },

  updated_date: {
    type: Date,
    default: Date.now,
  },
});

const userSession = mongoose.model(
  "UserSession",
  userSessionSchema,
  "userSession"
);
module.exports = userSession;
