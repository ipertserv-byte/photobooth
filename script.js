const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const rearBtn = document.getElementById("rearBtn");
const frontBtn = document.getElementById("frontBtn");

const status = document.getElementById("status");

let currentStream = null;
let currentCamera = "environment";
let imageData = "";

// =====================
// START CAMERA
// =====================
async function startCamera(camera) {

    // Stop previous camera
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: camera
                }
            },
            audio: false
        });

    } catch (err) {

        // Fallback if requested camera doesn't exist
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

    }

    currentCamera = camera;

    video.srcObject = currentStream;

    await video.play();

    // Wait until video is ready
    await new Promise(resolve => {
        if (video.readyState >= 2) {
            resolve();
        } else {
            video.onloadeddata = () => resolve();
        }
    });

    video.style.display = "block";
    preview.style.display = "none";

    captureBtn.style.display = "inline-block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "";
}

// =====================
// CAMERA BUTTONS
// =====================
rearBtn.addEventListener("click", () => {
    startCamera("environment");
});

frontBtn.addEventListener("click", () => {
    startCamera("user");
});

// =====================
// CAPTURE
// =====================
captureBtn.addEventListener("click", () => {

    if (!video.videoWidth || !video.videoHeight) {
        status.textContent = "Camera is still loading...";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    imageData = canvas.toDataURL("image/jpeg", 0.95);

    preview.src = imageData;

    preview.onload = () => {

        video.style.display = "none";
        preview.style.display = "block";

        captureBtn.style.display = "none";
        retakeBtn.style.display = "inline-block";
        uploadBtn.style.display = "inline-block";

        status.textContent = "Photo captured!";
    };

});

// =====================
// RETAKE
// =====================
retakeBtn.addEventListener("click", () => {

    preview.src = "";
    preview.style.display = "none";

    video.style.display = "block";

    captureBtn.style.display = "inline-block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "";

});

// =====================
// UPLOAD
// =====================
uploadBtn.addEventListener("click", () => {

    alert("Next step: Cloudinary Upload");

});

// =====================
// START APP
// =====================
startCamera(currentCamera);
