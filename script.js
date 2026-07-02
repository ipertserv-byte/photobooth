const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const Btn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const status = document.getElementById("status");
const frontBtn = document.getElementById("frontBtn");
const rearBtn = document.getElementById("rearBtn");

let imageData = "";

let currentCamera = "environment";
let currentStream = null;

async function startCamera() {

    try {

        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentCamera
            },
            audio: false
        });

        video.srcObject = currentStream;

    } catch (error) {

        status.innerHTML = "❌ Camera access denied.";

    }
}

captureBtn.addEventListener("click", () => {
    const ctx = canvas.getContext("2d");
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    // Check if the device is currently in portrait mode
    const isPortrait = window.innerHeight > window.innerWidth;
    // Determine if the video stream orientation matches the screen
    const needsRotation =
        (isPortrait && vw > vh) ||
        (!isPortrait && vh > vw);
    if (needsRotation) {
        canvas.width = vh;
        canvas.height = vw;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(video, -vw / 2, -vh / 2, vw, vh);
        ctx.restore();
    } else {
        canvas.width = vw;
        canvas.height = vh;
        ctx.drawImage(video, 0, 0, vw, vh);
    }
    imageData = canvas.toDataURL("image/jpeg", 0.95);
    preview.src = imageData;
    preview.style.display = "block";
    video.style.display = "none";
    captureBtn.style.display = "none";
    retakeBtn.style.display = "inline-block";
    uploadBtn.style.display = "inline-block";
    status.innerHTML = "📸 Photo captured!";
});


retakeBtn.addEventListener("click", async () => {

    preview.style.display = "none";
    video.style.display = "block";

    captureBtn.style.display = "inline-block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";
    

    status.innerHTML = "";

    imageData = "";

    await startCamera(); // ensures camera resets cleanly
});

uploadBtn.addEventListener("click", uploadPhoto);


async function uploadPhoto() {

    
    if (!imageData) {
        status.innerHTML = "⚠️ No photo to upload.";
        return;
    }

    status.innerHTML = "☁️ Uploading...";

    const byteString = atob(imageData.split(",")[1]);
const mimeString = imageData.split(",")[0].split(":")[1].split(";")[0];

const ab = new ArrayBuffer(byteString.length);
const ia = new Uint8Array(ab);

for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
}

const blob = new Blob([ab], { type: mimeString });

    
    const formData = new FormData();

    formData.append("file", blob);
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

        console.log(data);

        if (data.secure_url) {

    alert("Photo uploaded successfully!");
status.innerHTML = "✅ Upload successful!";

setTimeout(() => {
    status.innerHTML = "";
}, 2000);

    preview.style.display = "none";
    video.style.display = "block";

    captureBtn.style.display = "inline-block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";

    imageData = "";

    setTimeout(() => {
    startCamera();
}, 300);

} else {

    console.log("Upload failed:", data);
status.innerHTML = "❌ Upload failed.";

}

    } catch (error) {

        console.error(error);

        status.innerHTML = "❌ Upload error.";

    }

}

frontBtn.addEventListener("click", async () => {
    currentCamera = "user";
    await startCamera();
});

rearBtn.addEventListener("click", async () => {
    currentCamera = "environment";
    await startCamera();
});

startCamera();
