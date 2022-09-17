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
import { useNavigate } from "react-router";

const socket = io("http://localhost:3030");

const logo = require("../assets/images/squidgamelogo.png");

const defaultWidth = 640;
const defaultHeight = 480;

let greenLight = true;
let initialized = true;

let video: HTMLVideoElement;
let detector: poseDetection.PoseDetector;

function playAudio() {
  if (greenLight) {
    // var audio = new Audio("http://localhost:3000/greenlight.mp3");
    var audio = new Audio("http://localhost:3000/koreangreen.mp3");
    audio.play();
  } else {
    var audio = new Audio("http://localhost:3000/redlight.mp3");
    audio.play();
  }
}

function initGame() {
  // Video loop
  var fps = 1000;
  var now;
  var then = performance.now();
  var interval = 1000 / fps;
  (window as any).delta = 0;

  function loop() {
    if (!initialized) return;

    requestAnimationFrame(loop);

    now = performance.now();
    (window as any).delta = now - then;

    if ((window as any).delta > interval) {
      then = now - ((window as any).delta % interval);
      update();
    }
  }
  if (initialized) {
    loop();
  }
}

// Update function
async function update() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");

  if (!canvas || !ctx) {
    console.error("Canvas not found");
    return;
  }

  if (!video) {
    drawText(ctx, "Loading camera...", canvas.width / 2, canvas.height / 2, "50px Arial", "white", "center", "middle");
    return;
  }

  let poses = await detector.estimatePoses(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const pose of poses) {
    let points = pose.keypoints;

    const { angle, depth } = getAngle(points[5].x, points[6].x);
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
    drawPose(ctx, joints, body, depth);
  }

  // Draw stats
  drawText(ctx, "FPS: " + Math.round(10000 / (window as any).delta) / 10, 10, 30, undefined, "white", "left", "top");
  drawText(ctx, "# of poses: " + poses.length, 10, 60, undefined, "white", "left", "top");
}

export async function startPosing(canvas_: HTMLCanvasElement, video_: HTMLVideoElement) {
  await tf.ready();

  const detectorConfig = { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING, enableTracking: true };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

  if (!canvas_ || !video_) {
    console.error("Unable to get canvas or video element");
    return;
  }

  //? We could change this in the future
  canvas_.width = 600;
  canvas_.height = 480;

  video = video_;
}

const Game: React.FC = () => {
  const [isGreen, setIsGreen] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initialized = true;

    initializeCamera();
    initGame();

    return () => {
      initialized = false;
    };
  }, []);

  const switchColour = () => {
    setIsGreen(!isGreen);
    greenLight = !greenLight;

    playAudio();
  };

  const startGame = () => {
    setIsStarted(!isStarted);

    if (!isStarted) {
      playAudio();
    }
  };

  return (
    <div className="game" style={{ backgroundColor: isStarted ? (isGreen ? "green" : "red") : "#132228" }}>
      <img id="logo" src={logo} style={{ width: 100, position: "absolute", left: 10, top: 10 }} onClick={() => navigate("/")} />

      <h1>Game In Action</h1>
      <div className="video">
        <canvas id="canvas" width="500" height="500" style={{ position: "absolute", zIndex: 1 }}></canvas>
        <video autoPlay id="video" style={{ width: "600px", height: "480px", transform: "rotateY(180deg)", position: "absolute" }} />
      </div>
      <div id="button-container" style={{ width: "500px" }}>
        <button onClick={startGame} className="play-button">
          {isStarted ? "Stop Game" : "Start Game"}
        </button>
        {isStarted && (
          <button onClick={switchColour} className="play-button">
            Switch Color (Spacebar)
          </button>
        )}
      </div>
    </div>
  );
};

export default Game;
