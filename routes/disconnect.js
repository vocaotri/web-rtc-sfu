const disconnecttRoutes = (app, webrtc, senderStream, peerUser) => {
  app.post("/disconnect/:roomID/:userID", async (req, res) => {
    if (req.params.roomID === "null")
      return res.status(401).json({ error: "no room id" });
    if (req.params.userID === "null")
      return res.status(401).json({ error: "no user id" });
    var roomID = parseInt(req.params.roomID);
    var userID = parseInt(req.params.userID);
    if (typeof peerUser[userID] === "undefined")
      return res.status(401).json({ error: "peer not found" });
    peerUser[userID].close();
    delete peerUser[userID];
    return res.json({ success: "clear peer succees" });
  });
};
module.exports = disconnecttRoutes;
