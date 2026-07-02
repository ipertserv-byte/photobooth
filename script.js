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

// Start camera
async function startCamera(camera) {

    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: camera }
            },
            audio: false
        });

    } catch (e) {

        // Fallback to any camera
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

    }

    video.srcObject = currentStream;
    await video.play();

    status.textContent = "";

    video.style.display = "block";
    preview.style.display = "none";

    captureBtn.style.display = "inline-block";
    retakeBtn.style.display = "none";
    uploadBtn.style.display = "none";
}

        status.textContent = "";

    }catch(err){

        console.error(err);
        status.textContent = "Unable to access camera.";

    }

}

// Rear camera
rearBtn.onclick = () => {
    startCamera("environment");
};

// Front camera
frontBtn.onclick = () => {
    startCamera("user");
};

// Start rear camera automatically
startCamera("environment");

captureBtn.onclick = () => {

    status.textContent = "Capture button pressed...";

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        status.textContent = "Video is not ready yet.";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    preview.src = canvas.toDataURL("image/jpeg");

    video.style.display = "none";
    preview.style.display = "block";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "inline-block";
    uploadBtn.style.display = "inline-block";

    status.textContent = "Photo captured!";
};
