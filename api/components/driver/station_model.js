const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  station_name: {
    type: String,
    required: true,
  },

  created_date: {
    type: Date,
    default: Date.now,
  },

  updated_date: {
    type: Date,
    default: Date.now,
  },
});

const station = mongoose.model("Station", stationSchema, "station");
module.exports = station;
