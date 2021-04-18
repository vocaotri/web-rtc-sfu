const express = require("express");
const app = express();
const webrtc = require("wrtc");
fs = require("fs");
var port = process.env.PORT || 3000;
let senderStream = [];
let peerUser = [];

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  const allowedOrigins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8080",
    "http://localhost:9000",
    "https://webrct-sfu-demo.herokuapp.com/",
  ];
  const origin = req.headers.origin;
  // Website you wish to allow to connect
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,x-socket-id,x-csrf-token"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.post("/consumer/:roomID/:userID", async (req, res) => {
  var roomID = parseInt(req.params.roomID);
  var userID = parseInt(req.params.userID);
  if (req.params && typeof senderStream[roomID] !== "undefined") {
    peerUser[userID] = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.viva.gr",
        },
      ],
    });
    const desc = new webrtc.RTCSessionDescription(req.body.sdp);
    await peerUser[userID].setRemoteDescription(desc);
    senderStream[roomID]
      .getTracks()
      .forEach((track) =>
        peerUser[userID].addTrack(track, senderStream[roomID])
      );
    const answer = await peerUser[userID].createAnswer();
    await peerUser[userID].setLocalDescription(answer);
    const payload = {
      sdp: peerUser[userID].localDescription,
    };
    res.json(payload);
  } else {
    res.json({ error: "no room id" });
  }
});
app.post("/disconnect/:RoomID/:userID", async (req, res) => {
  var roomID = parseInt(req.params.roomID);
  var userID = parseInt(req.params.userID);
  if (req.params && typeof senderStream[roomID] !== "undefined") {
    senderStream[roomID]
      .getTracks()
      .forEach((track) =>
        peerUser[userID].removeTrack(track, senderStream[roomID])
      );
    delete peerUser[userID];
  }
});

app.post("/broadcast/:roomID", async (req, res) => {
  if (req.params) {
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.viva.gr",
        },
      ],
    });
    var roomID = parseInt(req.params.roomID);
    peer.ontrack = (e) => handleTrackEvent(e, peer, roomID);
    const desc = new webrtc.RTCSessionDescription(req.body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription,
    };
    res.json(payload);
  } else {
    res.json({ error: "no room id" });
  }
});

function handleTrackEvent(e, peer, roomID) {
  senderStream[roomID] = e.streams[0];
}

app.listen(port, () => console.log("server started : " + port));
