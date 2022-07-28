const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("./_helpers/jwt");
const config = require("./api/config/index.js");
const requestIp = require("request-ip");
const cors = require("cors");
const {
  success,
  serverError,
  validation,
  unAuthorized,
} = require("./_helpers/responseApi");

const app = express();
let port = process.env.PORT || 8000;
mongoose.connect(
  config.mongoDBConnectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error, connectionSuccess) => {
    if (error) {
      console.log(
        "Error while connecting to MongoDB. " + JSON.stringify(error)
      );
    } else {
      console.log("Successfully connected to MongoDB.");
    }
  }
);

app.use(requestIp.mw());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "200mb" }));
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// use JWT auth to secure the api
app.use(jwt());

require("./api/routers/index")(app);
// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  console.log("err");
  console.log(err);
  if (err.name === "UnauthorizedError") {
    res.status(401).json(unAuthorized(err.name + ": " + err.message));
  }
});

app.listen(port);
console.log("app is listening in port " + port);
