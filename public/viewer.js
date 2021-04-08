const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}
getCamera();
async function init() {
    const peer = createPeer();
    peer.addTransceiver("video", { direction: "recvonly" })
}
async function getCamera(device = true) {
    let width = { ideal: 854 };
    let height = { ideal: 480 };
    console.log({
        video: typeof device === "boolean" ? device : { ...device, width: width, height: height },
        audio: true
    })
    return navigator.mediaDevices.getUserMedia({
        video: typeof device === "boolean" ? device : { ...device, width: width, height: height },
        audio: true
    });
}
async function getConnectedDevices(kind = 'videoinput') {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === kind);
}

async function getDeviceIdCamera(key = 0) {
    let listCamera = await getConnectedDevices();
    await listCamera.forEach((item) => {
        if (item.deviceId != null && item.deviceId != '')
            cameraDeviceId.push({ diviceId: item.deviceId, label: item.label });
    });
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/consumer/' + urlParams.get('room_id'), payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function handleTrackEvent(e) {
    document.getElementById("video").srcObject = e.streams[0];
};

