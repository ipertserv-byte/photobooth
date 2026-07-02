const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const rearBtn = document.getElementById("rearBtn");
const frontBtn = document.getElementById("frontBtn");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const status = document.getElementById("status");

let currentStream = null;
let currentCamera = "environment";
let imageData = "";

// =========================
// START CAMERA
// =========================
async function startCamera(camera = "environment") {

    try {

        // stop previous stream
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // start new stream
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: camera
                }
            },
            audio: false
        });

        currentCamera = camera;

        // LIVE PREVIEW MIRROR ONLY FOR FRONT CAMERA
        if (camera === "user") {
            video.style.transform = "scaleX(-1)";
        } else {
            video.style.transform = "scaleX(1)";
        }

        video.srcObject = currentStream;
        await video.play();

        // reset UI
        preview.style.display = "none";
        video.style.display = "block";

        captureBtn.style.display = "block";
        retakeBtn.style.display = "none";
        uploadBtn.style.display = "none";

        status.textContent = "";

    } catch (err) {
        console.error(err);
        status.textContent = "Unable to access camera.";
    }
}

// =========================
// CAMERA SWITCH
// =========================
rearBtn.addEventListener("click", () => {
    startCamera("environment");
});

frontBtn.addEventListener("click", () => {
    startCamera("user");
});

// =========================
// CAPTURE (ONLY FRONT CAMERA IS MIRRORED)
// =========================
captureBtn.addEventListener("click", () => {

    if (!video.videoWidth) {
        status.textContent = "Camera is still loading...";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    // ONLY mirror when using FRONT camera
    if (currentCamera === "user") {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    imageData = canvas.toDataURL("image/jpeg", 0.95);

    // preview = same as output (NO transform)
    preview.src = imageData;

    preview.style.display = "block";
    video.style.display = "none";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "block";
    uploadBtn.style.display = "block";

    status.textContent = "Photo captured.";
});

// =========================
// RETAKE
// =========================
retakeBtn.addEventListener("click", () => {

    preview.src = "";
    preview.style.display = "none";

    video.style.display = "block";

    captureBtn.style.display = "block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "";
});

// =========================
// UPLOAD (placeholder)
// =========================
uploadBtn.addEventListener("click", () => {

    alert("Cloudinary upload will be added next.");
});

// =========================
// START
// =========================
startCamera();
