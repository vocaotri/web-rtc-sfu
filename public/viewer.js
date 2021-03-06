const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
init();
// window.onload = () => {
//   document.getElementById("my-button").onclick = () => {
//     init();
//   };
// };
async function init() {
  const peer = createPeer();
  peer.addTransceiver("audio", { direction: "recvonly" });
  peer.addTransceiver("video", { direction: "recvonly" });
}

function createPeer() {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com",
      },
    ],
  });
  peer.ontrack = handleTrackEvent;
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
  };

  const { data } = await axios.post(
    "/consumer/" + urlParams.get("room_id") + "/" + urlParams.get("user_id"),
    payload
  );
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}
function handleTrackEvent(e) {
  document.getElementById("video").srcObject = e.streams[0];
}
