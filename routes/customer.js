const customerRoutes = (app, webrtc, senderStream, peerUser) => {
  app.post("/consumer/:roomID/:userID", async (req, res) => {
    if (req.params.roomID === "null")
      return res.status(401).json({ error: "no room id" });
    if (req.params.userID === "null")
      return res.status(401).json({ error: "no user id" });
    var roomID = parseInt(req.params.roomID);
    var userID = parseInt(req.params.userID);
    if (typeof senderStream[roomID] === "undefined")
      return res.status(401).json({ error: "sender not found" });
    if (peerUser[userID]) await peerUser[userID].close();
    peerUser[userID] = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: process.env.STUN_URL,
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
  });
};
module.exports = customerRoutes;
