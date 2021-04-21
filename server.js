const express = require("express");
const app = express();
const webrtc = require("wrtc");
fs = require("fs");
require("dotenv").config();
var port = process.env.PORT || 3000;
let senderStream = [];
let peerUser = [];

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// this is where we'll handle our various routes from
require("./routes/routes.js")(app, webrtc, senderStream, peerUser);

app.listen(port, () => console.log("server started : " + port));
