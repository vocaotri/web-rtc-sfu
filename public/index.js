const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}
var cameraDeviceId = [];
async function init() {
    await getDeviceIdCamera();
    console.log(cameraDeviceId);
    const stream = await getCamera({ deviceId: { exact: urlParams.get('room_id') == "1" ? "819e905600df1db315e25002d1c14852a3c4e126e901a657efe1a58b1af9716a" : "38b451a4041bf276100bcf5f61a686a1870f3959ed7ece6c43b022a09433c8c3" } });
    console.log(stream)
    document.getElementById("video").srcObject = stream;
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
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
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/broadcast/' + urlParams.get('room_id'), payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

