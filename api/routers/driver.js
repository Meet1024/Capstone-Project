const express = require("express");
const driver_router = express.Router();

const driver_controller = require("../components/driver/driver.js");

driver_router.post("/ussdconversation", driver_controller.ussdConversation);

module.exports = driver_router;
