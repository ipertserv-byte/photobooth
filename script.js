const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const rearBtn = document.getElementById("rearBtn");
const frontBtn = document.getElementById("frontBtn");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const status = document.getElementById("status");

let currentStream;

// start camera (default front)
async function startCamera(facingMode = "user") {

    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    currentStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
    });

    video.srcObject = currentStream;

    video.style.display = "block";
    preview.style.display = "none";

    status.textContent = facingMode === "user"
        ? "Selfie Camera Active"
        : "Rear Camera Active";
}

// mirror-safe capture
function capturePhoto() {
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // mirror fix (IMPORTANT)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    preview.src = imageData;

    video.style.display = "none";
    preview.style.display = "block";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "block";
    uploadBtn.style.display = "block";

    status.textContent = "Photo Captured!";
}

function retakePhoto() {
    video.style.display = "block";
    preview.style.display = "none";

    captureBtn.style.display = "block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "Ready";
}

async function uploadPhoto() {
    status.textContent = "Uploading...";

    setTimeout(() => {
        status.textContent = "Uploaded Successfully (demo)";
    }, 1000);
}

// events
rearBtn.onclick = () => startCamera("environment");
frontBtn.onclick = () => startCamera("user");

captureBtn.onclick = capturePhoto;
retakeBtn.onclick = retakePhoto;
uploadBtn.onclick = uploadPhoto;

// init
startCamera();
