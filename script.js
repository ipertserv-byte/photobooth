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

let captureMode = "single";
let gridShots = [];
const maxShots = 4;

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
                facingMode: { ideal: camera }
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
rearBtn.addEventListener("click", () => startCamera("environment"));
frontBtn.addEventListener("click", () => startCamera("user"));

// =========================
// MODE SWITCH
// =========================
document.getElementById("singleModeBtn").addEventListener("click", () => {
    captureMode = "single";
    gridShots = [];
    status.textContent = "Single mode";
});

document.getElementById("gridModeBtn").addEventListener("click", () => {
    captureMode = "grid";
    gridShots = [];
    status.textContent = "Grid mode (4 shots)";
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

    // mirror only front camera
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

    // =========================
    // GRID MODE LOGIC
    // =========================
    if (captureMode === "grid") {

        gridShots.push(imageData);

        status.textContent = `Shot ${gridShots.length} / ${maxShots}`;

        preview.style.display = "none";
        video.style.display = "block";

        if (gridShots.length < maxShots) {
            return;
        }

        buildGrid();
        return;
    }

    // =========================
    // SINGLE MODE
    // =========================
    preview.src = imageData;

    preview.style.display = "block";
    video.style.display = "none";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "block";
    uploadBtn.style.display = "block";

    status.textContent = "Photo captured.";
});

// =========================
// BUILD GRID FUNCTION
// =========================
function buildGrid() {

    const cols = 2;
    const rows = 2;

    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    const img = new Image();
    img.src = gridShots[0];

    img.onload = () => {

        tempCanvas.width = img.width * cols;
        tempCanvas.height = img.height * rows;

        let loaded = 0;

        for (let i = 0; i < gridShots.length; i++) {

            const image = new Image();
            image.src = gridShots[i];

            image.onload = () => {

                const col = i % cols;
                const row = Math.floor(i / cols);

                ctx.drawImage(
                    image,
                    col * img.width,
                    row * img.height,
                    img.width,
                    img.height
                );

                loaded++;

                if (loaded === gridShots.length) {

                    imageData = tempCanvas.toDataURL("image/jpeg", 0.95);

                    preview.src = imageData;

                    preview.style.display = "block";
                    video.style.display = "none";

                    captureBtn.style.display = "none";
                    retakeBtn.style.display = "block";
                    uploadBtn.style.display = "block";

                    status.textContent = "Grid complete!";
                }
            };
        }
    };
}

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

    gridShots = [];
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
