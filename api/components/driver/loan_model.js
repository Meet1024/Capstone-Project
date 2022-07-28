const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  loan_amount: {
    type: Number,
    required: true,
  },

  loan_payment_status: {
    type: String,
    required: true,
  },

  loan_taken_drivername: {
    type: String,
    required: true,
  },

  loan_taken_by_id: {
    type: String,
    required: true,
  },

  sessionId: {
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

  loan_taken_date: {
    type: Date,
    default: Date.now,
  },
  loan_paid_date: Date,
});

const loan = mongoose.model("Loan", loanSchema, "loan");
module.exports = loan;
