const broadcastRoutes = (app, webrtc, senderStream, peerUser) => {
  app.post("/broadcast/:roomID/:userID", async (req, res) => {
    if (req.params.roomID === "null")
      return res.status(401).json({ error: "no room id" });
    if (req.params.userID === "null")
      return res.status(401).json({ error: "no user id" });
    if (peerUser[userID]) return res.json({ error: "user already exist" });
    var roomID = parseInt(req.params.roomID);
    var userID = parseInt(req.params.userID);
    peerUser[userID] = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: process.env.STUN_URL,
        },
      ],
    });
    peerUser[userID].ontrack = (e) =>
      handleTrackEvent(e, peerUser[userID], roomID);
    const desc = new webrtc.RTCSessionDescription(req.body.sdp);
    await peerUser[userID].setRemoteDescription(desc);
    const answer = await peerUser[userID].createAnswer();
    await peerUser[userID].setLocalDescription(answer);
    const payload = {
      sdp: peerUser[userID].localDescription,
    };
    return res.json(payload);
  });
  function handleTrackEvent(e, peer, roomID) {
    senderStream[roomID] = e.streams[0];
  }
};
module.exports = broadcastRoutes;
