const expressJwt = require("express-jwt");
const config = require("../api/config/index.js");
const User = require("../api/components/driver/driver_model");

module.exports = jwt;

function jwt() {
  const secret = config.secret;
  return expressJwt({ secret, isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      "/api/v1/driver/ussdconversation",
    ],
  });
}

async function isRevoked(req, payload, done) {
  let currentTimeEpoch = Math.round(new Date().getTime() / 1000);

  if (currentTimeEpoch > payload.exp) {
    return done(null, true);
  }
  let user = await User.findById(payload._id);
  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }
  done();
}
