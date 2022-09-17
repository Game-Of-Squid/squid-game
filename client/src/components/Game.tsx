import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import "@tensorflow/tfjs-backend-wasm";
import { useEffect } from "react";

import Ola from "ola";

import { useState } from "react";

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  c?: string,
  options?: { [key: string]: any },
  arc?: number,
  start?: number
) {
  if (!options) options = {};

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, start || 0, arc || 2 * Math.PI, false);
  ctx.fillStyle = c || "red";
  ctx.globalAlpha = options.alpha || 1;
  if (options.glow) ctx.shadowBlur = options.glowWidth || 100;
  if (options.glowColor) ctx.shadowColor = options.glowColor || "aqua";
  if (options.fill || options.fill == undefined) ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = options.outlineWidth || 1;
  ctx.strokeStyle = options.outlineColor || "black";
  if (options.outline) ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness?: number,
  cap?: CanvasLineCap,
  alpha?: number
) {
  ctx.beginPath();
  ctx.lineWidth = thickness || 1;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.globalAlpha = alpha || 1;
  ctx.strokeStyle = color || "black";
  ctx.lineCap = cap || "butt";
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.closePath();
}

const defaultWidth = 640;
const defaultHeight = 480;

let currPoseData = [];

async function startPosing(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  await tf.ready();

  const detectorConfig = { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING };
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
      const body: { [key: string]: poseDetection.Keypoint } = {};
      const joints: { [key: string]: any } = {};

      // Convert points to body joints

      currPoseData = [];
      for (const p of points) {
        if (!p.name) continue;
        currPoseData.push(p.x / defaultWidth);
        currPoseData.push(p.y / defaultHeight);
        p.x = (canvas.width - p.x - (canvas.width - defaultWidth)) * (canvas.width / defaultWidth);
        p.y = p.y * (canvas.height / defaultHeight);
        body[p.name] = p;
      }

      // Joints
      for (let id of Object.keys(body)) {
        if (joints[id]) {
          joints[id].x = body[id].x;
          joints[id].y = body[id].y;
        } else {
          joints[id] = Ola({ x: body[id].x, y: body[id].y }, 50);
        }
      }

      // SKELETON
      let nose = {
        x: body["nose"].x,
        y: body["nose"].y,
      };

      let neck = {
        x: (body["left_shoulder"].x + body["right_shoulder"].x) / 2,
        y: (body["left_shoulder"].y + body["right_shoulder"].y) / 2,
      };
      neckArray.push(neck.y);

      let dick = {
        x: (body["left_hip"].x + body["right_hip"].x) / 2,
        y: (body["left_hip"].y + body["right_hip"].y) / 2,
      };

      let knee = {
        x: (body["left_knee"].x + body["right_knee"].x) / 2,
        y: (body["left_knee"].y + body["right_knee"].y) / 2,
      };

      let foot = {
        x: (body["left_ankle"].x + body["right_ankle"].x) / 2,
        y: (body["left_ankle"].y + body["right_ankle"].y) / 2,
      };

      // Draw the skeleton
      drawLine(ctx, joints["left_ear"].x, joints["left_ear"].y, joints["left_eye"].x, joints["left_eye"].y, "lime", 4);
      drawLine(ctx, joints["left_eye"].x, joints["left_eye"].y, joints["nose"].x, joints["nose"].y, "lime", 4);
      drawLine(ctx, joints["nose"].x, joints["nose"].y, joints["right_eye"].x, joints["right_eye"].y, "lime", 4);
      drawLine(ctx, joints["right_eye"].x, joints["right_eye"].y, joints["right_ear"].x, joints["right_ear"].y, "lime", 4);

      drawLine(ctx, joints["left_wrist"].x, joints["left_wrist"].y, joints["left_elbow"].x, joints["left_elbow"].y, "lime", 4);
      drawLine(ctx, joints["left_elbow"].x, joints["left_elbow"].y, joints["left_shoulder"].x, joints["left_shoulder"].y, "lime", 4);

      drawLine(ctx, joints["right_wrist"].x, joints["right_wrist"].y, joints["right_elbow"].x, joints["right_elbow"].y, "lime", 4);
      drawLine(ctx, joints["right_elbow"].x, joints["right_elbow"].y, joints["right_shoulder"].x, joints["right_shoulder"].y, "lime", 4);

      drawLine(
        ctx,
        joints["left_shoulder"].x,
        joints["left_shoulder"].y,
        joints["right_shoulder"].x,
        joints["right_shoulder"].y,
        "lime",
        4
      );
      drawLine(ctx, joints["left_hip"].x, joints["left_hip"].y, joints["right_hip"].x, joints["right_hip"].y, "lime", 4);

      drawLine(ctx, joints["left_shoulder"].x, joints["left_shoulder"].y, joints["left_hip"].x, joints["left_hip"].y, "lime", 4);
      drawLine(ctx, joints["right_shoulder"].x, joints["right_shoulder"].y, joints["right_hip"].x, joints["right_hip"].y, "lime", 4);

      drawLine(ctx, joints["left_knee"].x, joints["left_knee"].y, joints["left_hip"].x, joints["left_hip"].y, "lime", 4);
      drawLine(ctx, joints["right_knee"].x, joints["right_knee"].y, joints["right_hip"].x, joints["right_hip"].y, "lime", 4);

      drawLine(ctx, joints["left_knee"].x, joints["left_knee"].y, joints["left_ankle"].x, joints["left_ankle"].y, "lime", 4);
      drawLine(ctx, joints["right_knee"].x, joints["right_knee"].y, joints["right_ankle"].x, joints["right_ankle"].y, "lime", 4);

      // Draw the joints
      for (let id of Object.keys(joints)) {
        let p = joints[id];
        drawCircle(ctx, p.x, p.y, 5);
        body[p.name] = p;
      }

      drawCircle(ctx, neck.x, neck.y, 5);
      drawCircle(ctx, dick.x, dick.y, 5);
      drawCircle(ctx, knee.x, knee.y, 5);
      drawCircle(ctx, foot.x, foot.y, 5);

      drawLine(ctx, nose.x, nose.y, neck.x, neck.y, "white", 8);
      drawLine(ctx, neck.x, neck.y, dick.x, dick.y, "white", 8);
      drawLine(ctx, dick.x, dick.y, knee.x, knee.y, "white", 8);
      drawLine(ctx, knee.x, knee.y, foot.x, foot.y, "white", 8);
    }
  }

  // Video loop
  var fps = 1000;
  var now;
  var then = Date.now();
  var interval = 1000 / fps;
  (window as any).delta = 0;

  let neckArray = [];

  function loop() {
    requestAnimationFrame(loop);

    now = Date.now();
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
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const video = document.getElementById("video") as HTMLVideoElement;

    if (canvas && video) {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(function (stream) {
            video.srcObject = stream;
            startPosing(canvas, video);
          })
          .catch(function (err0r) {
            console.log("Something went wrong!");
          });
      }
    }
  }, []);

  const [isGreen, setIsGreen] = useState(true);

  const switchColour = () => {
    setIsGreen(!isGreen);
  }

  return (
    <div className={`game ${isGreen ? 'green' : 'red'}`}>
      <h1>Game In Action</h1>
      <div className='video'>
        <canvas id="canvas" width="500" height="500" style={{ position: "absolute", zIndex: 1 }}></canvas>
        <video autoPlay id="video" style={{ width: "600px", height: "480px", transform: "rotateY(180deg)", position: "absolute" }} />
      </div>
      <button onClick={switchColour} className='play-button'>Switch Color (we can change this button to just a key down event)</button>
    </div>
  );
};

export default Game;
