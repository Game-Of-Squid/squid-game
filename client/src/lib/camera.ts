import { startPosing } from "../components/Game";

export default function initializeCamera() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const video = document.getElementById("video") as HTMLVideoElement;

  if (!canvas || !video) {
    console.error("Canvas or video element not found");
    return;
  }
  if (!navigator.mediaDevices.getUserMedia) {
    console.error("getUserMedia() is not supported by your browser");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
      return new Promise((resolve) => (video.onplaying = resolve));
    })
    .then(() => {
      startPosing(canvas, video);
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}
