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
let camera = "environment";

let mode = "single"; // single or grid
let shots = [];
const MAX_SHOTS = 4;

// CAMERA
async function startCamera(facing) {
    try {
        if (stream) stream.getTracks().forEach(t => t.stop());

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facing } },
            audio: false
        });

        camera = facing;
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

// SWITCH CAMERA
rearBtn.onclick = () => startCamera("environment");
frontBtn.onclick = () => startCamera("user");

// CAPTURE
captureBtn.onclick = () => {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (camera === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/jpeg", 0.95);

    shots.push(img);

    // SINGLE MODE
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

    // GRID MODE (4 shots)
    if (shots.length < MAX_SHOTS) {
        status.textContent = `Shot ${shots.length}/4`;
        return;
    }

    buildGrid();
};

// GRID BUILDER
function buildGrid() {

    const temp = document.createElement("canvas");
    const ctx = temp.getContext("2d");

    const img = new Image();
    img.src = shots[0];

    img.onload = () => {

        const w = img.width;
        const h = img.height;

        temp.width = w * 2;
        temp.height = h * 2;

        shots.forEach((src, i) => {
            const image = new Image();
            image.src = src;

            image.onload = () => {

                const x = (i % 2) * w;
                const y = Math.floor(i / 2) * h;

                ctx.drawImage(image, x, y, w, h);

                if (i === shots.length - 1) {
                    preview.src = temp.toDataURL("image/jpeg", 0.95);

                    video.style.display = "none";
                    preview.style.display = "block";

                    captureBtn.style.display = "none";
                    retakeBtn.style.display = "block";
                    uploadBtn.style.display = "block";

                    status.textContent = "Grid complete!";
                }
            };
        });
    };
}

// RETAKE
retakeBtn.onclick = () => {
    shots = [];
    preview.src = "";

    video.style.display = "block";
    preview.style.display = "none";

    captureBtn.style.display = "block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    status.textContent = "";
};

// UPLOAD (placeholder)
uploadBtn.onclick = () => {
    alert("Upload coming next (Cloudflare / Cloudinary)");
};

// INIT
startCamera("environment");
