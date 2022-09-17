import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
// import "@tensorflow/tfjs-backend-wasm";
import { useEffect } from "react";
import Ola from "ola";
import { useState } from "react";
import { drawPose, drawText } from "../lib/helper";
import { io } from "socket.io-client";
import { getAngle } from "../lib/angle";
import initializeCamera from "../lib/camera";

const socket = io("http://localhost:3030");

const defaultWidth = 640;
const defaultHeight = 480;

let greenLight = true;

export async function startPosing(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  await tf.ready();

  const detectorConfig = { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING, enableTracking: true };
  const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

  if (!canvas || !video) {
    console.error("Unable to get canvas or video element");
    return;
  }

  canvas.width = 600;
  canvas.height = 480;

  const ctx = canvas.getContext("2d");

  // Update function
  async function update() {
    if (!canvas || !video || !ctx) {
      console.error("Unable to get canvas or video element");
      return;
    }

    let poses = await detector.estimatePoses(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const pose of poses) {
      let points = pose.keypoints;

      const angle = getAngle(points[5].x, points[6].x);
      if (!greenLight) {
        socket.emit("angle", angle);
      }

      const body: { [key: string]: poseDetection.Keypoint } = {};
      const joints: { [key: string]: any } = {};

      // Convert points to body joints
      for (const p of points) {
        if (!p.name) continue;
        const id = p.name;

        p.x = (canvas.width - p.x - (canvas.width - defaultWidth)) * (canvas.width / defaultWidth);
        p.y = p.y * (canvas.height / defaultHeight);
        body[id] = p;

        if (joints[id]) {
          joints[id].x = body[id].x;
          joints[id].y = body[id].y;
        } else {
          joints[id] = Ola({ x: body[id].x, y: body[id].y }, 50);
        }
      }

      // Draw joints
      drawPose(ctx, joints, body);
    }

    // Draw stats
    drawText(ctx, "FPS: " + Math.round(10000 / (window as any).delta) / 10, 10, 40);
    drawText(ctx, "# of poses: " + poses.length, 10, 70);
  }

  // Video loop
  var fps = 1000;
  var now;
  var then = performance.now();
  var interval = 1000 / fps;
  (window as any).delta = 0;

  function loop() {
    requestAnimationFrame(loop);

    now = performance.now();
    (window as any).delta = now - then;

    if ((window as any).delta > interval) {
      then = now - ((window as any).delta % interval);

      update();
    }
  }
  loop();
}

const Game: React.FC = () => {
  useEffect(() => {
    initializeCamera();
  }, []);

  const [isGreen, setIsGreen] = useState(true);

  const switchColour = () => {
    setIsGreen(!isGreen);
    greenLight = !greenLight;
  };

  return (
    <div className={`game ${isGreen ? "green" : "red"}`}>
      <h1>Game In Action</h1>
      <div className="video">
        <canvas id="canvas" width="500" height="500" style={{ position: "absolute", zIndex: 1 }}></canvas>
        <video autoPlay id="video" style={{ width: "600px", height: "480px", transform: "rotateY(180deg)", position: "absolute" }} />
      </div>
      <button onClick={switchColour} className="play-button">
        Switch Color (we can change this button to just a key down event)
      </button>
    </div>
  );
};

export default Game;
