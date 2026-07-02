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

        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: camera
                }
            },
            audio: false
        });

        currentCamera = camera;
        if (camera === "user") {
    video.style.transform = "scaleX(-1)";
} else {
    video.style.transform = "scaleX(1)";
}

        video.srcObject = currentStream;

        await video.play();

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
// CAPTURE
// =========================
captureBtn.addEventListener("click", () => {

    if (!video.videoWidth) {
        status.textContent = "Camera is still loading...";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    // OPTION 1: always mirrored output
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    imageData = canvas.toDataURL("image/jpeg", 0.95);

    // Preview is just the output (NO transform)
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
// UPLOAD
// =========================
uploadBtn.addEventListener("click", () => {

    alert("Cloudinary upload will be added next.");

});

// =========================
// START
// =========================
startCamera();
