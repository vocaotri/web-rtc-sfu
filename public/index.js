const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const resolution = {
  QQVGA: {
    width: { ideal: 160 },
    height: { ideal: 120 },
  },
  QVGA: {
    width: { ideal: 320 },
    height: { ideal: 240 },
  },
  WQVGA: {
    width: { ideal: 428 },
    height: { ideal: 240 },
  },
  VGA: {
    width: { ideal: 640 },
    height: { ideal: 480 },
  },
  FWVGA: {
    width: { ideal: 854 },
    height: { ideal: 480 },
  },
  SVGA: {
    width: { ideal: 832 },
    height: { ideal: 624 },
  },
  QHD: {
    width: { ideal: 960 },
    height: { ideal: 540 },
  },
  HD: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  FullHD: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  TwoK: {
    width: { ideal: 2560 },
    height: { ideal: 1440 },
  },
  FourK: {
    width: { ideal: 3840 },
    height: { ideal: 2160 },
  },
};
window.onload = () => {
  document.getElementById("my-button").onclick = () => {
    init();
  };
};
var cameraDeviceId = [];
getCamera();
async function init() {
  await getDeviceIdCamera();
  const stream = await getCamera({
    deviceId: {
      exact: cameraDeviceId[0].diviceId,
      // urlParams.get("room_id") == "1"
      //   ?
      //   : cameraDeviceId[1].diviceId,
    },
  });
  document.getElementById("video").srcObject = stream;
  const peer = createPeer();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
}
async function getCamera(device = true) {
  let { width, height } = resolution.QHD;
  return navigator.mediaDevices.getUserMedia({
    video:
      typeof device === "boolean"
        ? device
        : { ...device, width: width, height: height },
    audio: true,
  });
}
async function getConnectedDevices(kind = "videoinput") {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === kind);
}

async function getDeviceIdCamera(key = 0) {
  let listCamera = await getConnectedDevices();
  await listCamera.forEach((item) => {
    if (item.deviceId != null && item.deviceId != "")
      cameraDeviceId.push({ diviceId: item.deviceId, label: item.label });
  });
}

function createPeer() {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
  });
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
    "/broadcast/" + urlParams.get("room_id"),
    payload
  );
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}
