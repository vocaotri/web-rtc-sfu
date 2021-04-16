const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
var port = process.env.PORT || 3000;
let senderStream = [];

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/consumer/:roomID", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,x-socket-id,x-csrf-token");
    if (req.params) {
        const peer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        var roomID = parseInt(req.params.roomID);
        const desc = new webrtc.RTCSessionDescription(req.body.sdp);
        await peer.setRemoteDescription(desc);
        senderStream[roomID].getTracks().forEach(track => peer.addTrack(track, senderStream[roomID]));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        const payload = {
            sdp: peer.localDescription
        }

        res.json(payload);
    }
    else {
        res.json({ error: "no room id" });
    }
});

app.post('/broadcast/:roomID', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,x-socket-id,x-csrf-token");
    if (req.params) {
        const peer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        var roomID = parseInt(req.params.roomID);
        peer.ontrack = (e) => handleTrackEvent(e, peer, roomID);
        const desc = new webrtc.RTCSessionDescription(req.body.sdp);
        await peer.setRemoteDescription(desc);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        const payload = {
            sdp: peer.localDescription
        }

        res.json(payload);
    } else {
        res.json({ error: "no room id" });
    }

});

function handleTrackEvent(e, peer, roomID) {
    senderStream[roomID] = e.streams[0];
};


app.listen(port, () => console.log('server started : ' + port));