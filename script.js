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

    if(currentStream){
        currentStream.getTracks().forEach(track => track.stop());
    }

    try{

        currentStream = await navigator.mediaDevices.getUserMedia({
            video:{
                facingMode: camera
            },
            audio:false
        });

        video.srcObject = currentStream;
        currentCamera = camera;

        video.style.display = "block";
        preview.style.display = "none";

        captureBtn.style.display = "inline-block";
        retakeBtn.style.display = "none";
        uploadBtn.style.display = "none";

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

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    preview.src = canvas.toDataURL("image/jpeg");

    video.style.display = "none";
    preview.style.display = "block";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "inline-block";
    uploadBtn.style.display = "inline-block";

};
