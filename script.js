const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const rearBtn = document.getElementById("rearBtn");
const frontBtn = document.getElementById("frontBtn");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const singleMode = document.getElementById("singleMode");
const gridMode = document.getElementById("gridMode");

const portraitBtn = document.getElementById("portraitBtn");
const landscapeBtn = document.getElementById("landscapeBtn");

const status = document.getElementById("status");

let currentStream = null;
let currentCamera = "environment";
let imageData = "";

function fixLandscapeVideo() {

    const isLandscape = window.innerWidth > window.innerHeight;

    if (!isLandscape) return;

    // DO NOT decide logic here
    // ONLY restore current state safely

    if (currentCamera === "user") {
        video.style.transform = "scaleX(-1)";
    } else {
        video.style.transform = "none";
    }
}


// New states
let photoMode = "single";          // single | grid
let orientation = "portrait";      // portrait | landscape


/* =========================
   START CAMERA
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
applyCameraTransform();
        video.srcObject = currentStream;
        await video.play();

        function applyCameraTransform() {
    if (currentCamera === "user") {
        video.style.transform = "scaleX(-1)";
    } else {
        video.style.transform = "none";
    }
}
       applyCameraTransform();

       
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

function getDeviceRotation() {

    // Modern browsers
    if (screen.orientation && typeof screen.orientation.angle === "number") {
        return screen.orientation.angle;
    }

    // iOS Safari
    if (typeof window.orientation === "number") {
        return window.orientation;
    }

    return 0;
}



/* =========================
   CAPTURE (FIXED — NO BUGS)
========================= */
captureBtn.addEventListener("click", () => {

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");

    // reset transforms
    ctx.setTransform(1, 0, 0, 1, 0, 0);

const angle = getDeviceRotation();

if (angle === 90 || angle === -90 || angle === 270) {

    canvas.width = videoHeight;
    canvas.height = videoWidth;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle > 0 ? Math.PI / 2 : -Math.PI / 2);

    if (currentCamera === "user") {
        ctx.scale(-1, 1);
    }

    ctx.drawImage(
        video,
        -videoWidth / 2,
        -videoHeight / 2,
        videoWidth,
        videoHeight
    );

} else {

    if (currentCamera === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

}
    
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
   UPLOAD (placeholder)
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
   PHOTO MODE UI
========================= */

singleMode.onclick = () => {

    photoMode = "single";

    singleMode.classList.add("active");
    gridMode.classList.remove("active");

    console.log("Photo Mode:", photoMode);

};

gridMode.onclick = () => {

    photoMode = "grid";

    gridMode.classList.add("active");
    singleMode.classList.remove("active");

    console.log("Photo Mode:", photoMode);

};

/* =========================
   ORIENTATION UI
========================= */

portraitBtn.onclick = async () => {

    orientation = "portrait";

    portraitBtn.classList.add("active");
    landscapeBtn.classList.remove("active");

    console.log("Orientation:", orientation);

    await startCamera(currentCamera);

};

landscapeBtn.onclick = async () => {

    orientation = "landscape";

    landscapeBtn.classList.add("active");
    portraitBtn.classList.remove("active");

    console.log("Orientation:", orientation);

    await startCamera(currentCamera);

};

/* =========================
   INIT
========================= */

startCamera();


window.addEventListener("resize", fixLandscapeVideo);
window.addEventListener("orientationchange", fixLandscapeVideo);
