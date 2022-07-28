const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },

  driver_name: {
    type: String,
    required: true,
  },

  // driver_mpin: {
  //   type: String,
  //   required: true,
  // },

  // driver_hash: {
  //   type: String,
  //   required: true,
  // },

  driver_license: {
    type: String,
    required: true,
  },

  driver_bike_rc_no: {
    type: String,
    required: true,
  },

  assigned_station_id: {
    type: String,
    required: true,
  },
  assigned_station_name: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    maxlength: 50,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  last_updated_by: {
    type: String,
    maxlength: 50,
  },
  last_updated_date: {
    type: Date,
    default: Date.now,
  },
});

const driver = mongoose.model("Driver", driverSchema, "driver");
module.exports = driver;
