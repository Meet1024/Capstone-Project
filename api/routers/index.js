const driver_router = require("./driver");

module.exports = (app) => {
  /**
   * Driver related routes
   */

  app.use("/api/v1/driver", driver_router);
};
