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
let currentCamera = "user"; // start with selfie or "environment"
let imageData = "";

/* =========================
   START CAMERA (AUTO ON LOAD)
========================= */
async function startCamera(camera = "user") {

    try {

        // stop previous stream safely
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: camera }
            },
            audio: false
        });

        currentCamera = camera;

        video.srcObject = currentStream;
        await video.play();

        // mirror selfie only
        if (currentCamera === "user") {
            video.style.transform = "scaleX(-1)";
        } else {
            video.style.transform = "none";
        }

        preview.style.display = "none";
        video.style.display = "block";

        captureBtn.style.display = "block";
        retakeBtn.style.display = "none";
        uploadBtn.style.display = "none";

        status.textContent = "";

    } catch (err) {
        console.error(err);
        status.textContent = "Camera permission denied or unavailable.";
    }
}

/* =========================
   INIT CAMERA ON PAGE LOAD
   (THIS TRIGGERS PROMPT)
========================= */
window.addEventListener("load", () => {
    startCamera("user"); // change to "environment" if you want rear first
});

/* =========================
   SWITCH CAMERA
========================= */
rearBtn.addEventListener("click", () => {
    startCamera("environment");
});

frontBtn.addEventListener("click", () => {
    startCamera("user");
});

/* =========================
   CAPTURE
========================= */
captureBtn.addEventListener("click", () => {

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");

    // mirror fix for selfie
    if (currentCamera === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    imageData = canvas.toDataURL("image/jpeg", 0.95);

    preview.src = imageData;

    video.style.display = "none";
    preview.style.display = "block";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "block";
    uploadBtn.style.display = "block";

    status.textContent = "Photo captured.";
});

/* =========================
   RETAKE
========================= */
retakeBtn.addEventListener("click", () => {

    preview.src = "";
    preview.style.display = "none";

    video.style.display = "block";

    captureBtn.style.display = "block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "";
});

/* =========================
   UPLOAD (CLOUDINARY)
========================= */
uploadBtn.addEventListener("click", async () => {

    if (!imageData) {
        alert("Please capture a photo first.");
        return;
    }

    status.textContent = "Uploading...";

    const formData = new FormData();
    formData.append("file", imageData);
    formData.append("upload_preset", "photobooth");

    try {

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/sfnq6tmp/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            status.textContent = "Upload successful!";
        } else {
            status.textContent = "Upload failed.";
            console.log(data);
        }

    } catch (err) {
        console.error(err);
        status.textContent = "Upload error.";
    }

});
