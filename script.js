const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

const status = document.getElementById("status");

async function startCamera(){

    try{

        const stream = await navigator.mediaDevices.getUserMedia({

            video:{
                facingMode:"environment"
            },

            audio:false

        });

        video.srcObject = stream;

    }catch(error){

        status.innerHTML="❌ Camera access denied.";

    }

}

captureBtn.addEventListener("click",()=>{

    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;

    const ctx=canvas.getContext("2d");

    ctx.drawImage(video,0,0);

    preview.src=canvas.toDataURL("image/png");

    preview.style.display="block";

    video.style.display="none";

    captureBtn.style.display="none";

    retakeBtn.style.display="inline-block";

    uploadBtn.style.display="inline-block";

    status.innerHTML="📷 Photo captured!";

});

retakeBtn.addEventListener("click",()=>{

    preview.style.display="none";

    video.style.display="block";

    captureBtn.style.display="inline-block";

    retakeBtn.style.display="none";

    uploadBtn.style.display="none";

    status.innerHTML="";

});

uploadBtn.addEventListener("click",()=>{

    alert("Upload feature coming next!");

});

startCamera();
