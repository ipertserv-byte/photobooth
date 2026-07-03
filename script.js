const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const rearBtn = document.getElementById("rearBtn");
const frontBtn = document.getElementById("frontBtn");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const portraitBtn = document.getElementById("portraitBtn");
const landscapeBtn = document.getElementById("landscapeBtn");

const singleMode = document.getElementById("singleMode");
const gridMode = document.getElementById("gridMode");

const status = document.getElementById("status");

/* =========================
   STATE (IMPORTANT ORDER FIX)
========================= */
let currentStream = null;
let currentCamera = "environment";
let imageData = "";

let photoMode = "single";   // "single" | "grid"
let gridImages = [];

/* =========================
   MODE SWITCH
========================= */
singleMode.onclick = () => {

    photoMode = "single";
    gridImages = [];

    singleMode.classList.add("active");
    gridMode.classList.remove("active");

    console.log("Mode:", photoMode);
};

gridMode.onclick = () => {

    photoMode = "grid";
    gridImages = [];

    gridMode.classList.add("active");
    singleMode.classList.remove("active");

    console.log("Mode:", photoMode);
};

/* =========================
   CAMERA START
========================= */
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

        video.srcObject = currentStream;
        await video.play();

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
        status.textContent = "Unable to access camera.";
    }
}

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
   CAPTURE (GRID FIX INSIDE)
========================= */
captureBtn.addEventListener("click", () => {

    /* ================= GRID MODE ================= */
    if (photoMode === "grid") {

        const image = canvas.toDataURL("image/jpeg", 0.95);
        gridImages.push(image);

        status.textContent = `Grid shot ${gridImages.length}/4`;

        if (gridImages.length === 4) {
            createGridCollage();
            gridImages = [];
        }

        return;
    }

    /* ================= SINGLE MODE ================= */

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");

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
   UPLOAD
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

/* =========================
   ORIENTATION UI
========================= */
portraitBtn.onclick = () => {
    console.log("Portrait mode selected");
};

landscapeBtn.onclick = () => {
    console.log("Landscape mode selected");
};

/* =========================
   GRID COLLAGE FUNCTION
========================= */
function createGridCollage() {

    const ctx = canvas.getContext("2d");
    const size = canvas.width / 2;

    const imgs = gridImages.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });

    Promise.all(imgs.map(img =>
        new Promise(resolve => (img.onload = resolve))
    )).then(() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(imgs[0], 0, 0, size, size);
        ctx.drawImage(imgs[1], size, 0, size, size);
        ctx.drawImage(imgs[2], 0, size, size, size);
        ctx.drawImage(imgs[3], size, size, size, size);

        const finalImage = canvas.toDataURL("image/jpeg", 0.95);

        preview.src = finalImage;

        video.style.display = "none";
        preview.style.display = "block";

        captureBtn.style.display = "none";
        retakeBtn.style.display = "block";
        uploadBtn.style.display = "block";

        imageData = finalImage;

        status.textContent = "Grid ready for upload!";
    });
}

/* =========================
   INIT
========================= */
startCamera();
