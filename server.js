const express = require("express");
const app = express();
const webrtc = require("wrtc");
fs = require("fs");
var port = process.env.PORT || 3000;
let senderStream = [];

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

app.post("/consumer/:roomID", async (req, res) => {
  var roomID = parseInt(req.params.roomID);
  if (req.params && typeof senderStream[roomID] !== "undefined") {
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    const desc = new webrtc.RTCSessionDescription(req.body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream[roomID]
      .getTracks()
      .forEach((track) => peer.addTrack(track, senderStream[roomID]));
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
app.post("/disconnect/:RoomID", async (req, res) => {
  var roomID = parseInt(req.params.roomID);
  const peer = new webrtc.RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
  const desc = new webrtc.RTCSessionDescription(req.body.sdp);
  await peer.setRemoteDescription(desc);
  senderStream[roomID]
    .getTracks()
    .forEach((track) => peer.removeTrack(track, senderStream[roomID]));
});

app.post("/broadcast/:roomID", async (req, res) => {
  if (req.params) {
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
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
