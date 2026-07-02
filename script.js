const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const rearBtn = document.getElementById("rearBtn");
const frontBtn = document.getElementById("frontBtn");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const status = document.getElementById("status");

let stream = null;
let facingMode = "environment";

let shots = [];
const MAX_SHOTS = 4;

// START CAMERA
async function startCamera(mode) {
    try {
        facingMode = mode;

        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: mode } },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        video.style.display = "block";
        preview.style.display = "none";

        captureBtn.style.display = "block";
        retakeBtn.style.display = "none";
        uploadBtn.style.display = "none";

        shots = [];
        status.textContent = "Camera ready";

    } catch (err) {
        console.error(err);
        status.textContent = "Camera error";
    }
}

// SWITCH CAMERAS
rearBtn.onclick = () => startCamera("environment");
frontBtn.onclick = () => startCamera("user");

// CAPTURE
captureBtn.onclick = () => {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    // FIX: only mirror preview, not final image
    if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/jpeg", 0.95);
    shots.push(img);

    if (shots.length === 1) {
        preview.src = img;

        video.style.display = "none";
        preview.style.display = "block";

        captureBtn.style.display = "none";
        retakeBtn.style.display = "block";
        uploadBtn.style.display = "block";

        status.textContent = "Photo captured";
        return;
    }

    if (shots.length < MAX_SHOTS) {
        status.textContent = `Shot ${shots.length}/${MAX_SHOTS}`;
        return;
    }

    buildGrid();
};

// GRID BUILDER (FIXED ORDER LOADING)
function buildGrid() {

    const temp = document.createElement("canvas");
    const ctx = temp.getContext("2d");

    const base = new Image();
    base.src = shots[0];

    base.onload = () => {

        const w = base.width;
        const h = base.height;

        temp.width = w * 2;
        temp.height = h * 2;

        let loaded = 0;

        shots.forEach((src, i) => {
            const img = new Image();

            img.onload = () => {
                const x = (i % 2) * w;
                const y = Math.floor(i / 2) * h;

                ctx.drawImage(img, x, y, w, h);

                loaded++;

                if (loaded === shots.length) {
                    preview.src = temp.toDataURL("image/jpeg", 0.95);

                    video.style.display = "none";
                    preview.style.display = "block";

                    captureBtn.style.display = "none";
                    retakeBtn.style.display = "block";
                    uploadBtn.style.display = "block";

                    status.textContent = "Grid complete!";
                }
            };

            img.src = src;
        });
    };
}

// RETAKE
retakeBtn.onclick = () => {
    shots = [];

    preview.src = "";
    preview.style.display = "none";
    video.style.display = "block";

    captureBtn.style.display = "block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "";
};

// UPLOAD (placeholder)
uploadBtn.onclick = () => {
    alert("Upload system will be connected next (Cloudflare / Cloudinary)");
};

// INIT
startCamera("environment");
