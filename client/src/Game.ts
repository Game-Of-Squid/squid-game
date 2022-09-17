import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
// import "@tensorflow/tfjs-backend-wasm";
import { drawPose, drawText } from "./lib/helper";
import Ola from "ola";
import { io } from "socket.io-client";
import { getAngle } from "./lib/angle";

const socket = io("http://localhost:3030");

export class Game {
  defaultWidth = 640;
  defaultHeight = 480;

  initialized = false;

  greenLight = true;

  video: HTMLVideoElement | undefined;
  detector: poseDetection.PoseDetector | undefined;

  constructor() {}

  async initializePoseDetection(canvas_: HTMLCanvasElement, video_: HTMLVideoElement) {
    await tf.ready();

    const detectorConfig = { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING, enableTracking: true };
    this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    if (!canvas_ || !video_) {
      console.error("Unable to get canvas or video element");
      return;
    }

    //? We could change this in the future
    canvas_.width = 600;
    canvas_.height = 480;

    game.video = video_;
  }

  init() {
    // Video loop
    var fps = 1000;
    var now;
    var then = performance.now();
    var interval = 1000 / fps;
    (window as any).delta = 0;

    const self = this;

    function loop() {
      if (!self.initialized) return;

      requestAnimationFrame(loop);

      now = performance.now();
      (window as any).delta = now - then;

      if ((window as any).delta > interval) {
        then = now - ((window as any).delta % interval);
        self.update();
      }
    }
    if (this.initialized) {
      loop();
    }
  }

  // Update function
  async update() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    if (!canvas || !ctx) {
      console.error("Canvas not found");
      return;
    }

    if (!this.video || !this.detector) {
      const text = !this.detector && this.video ? "Loading model..." : "Loading video...";
      drawText(ctx, text, canvas.width / 2, canvas.height / 2, "50px Arial", "white", "center", "middle");
      return;
    }

    let poses = await this.detector.estimatePoses(this.video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawPoses(ctx, canvas, poses);

    // Draw stats
    drawText(ctx, "FPS: " + Math.round(10000 / (window as any).delta) / 10, 10, 30, undefined, "white", "left", "top");
    drawText(ctx, "# of poses: " + poses.length, 10, 60, undefined, "white", "left", "top");
  }

  drawPoses(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, poses: poseDetection.Pose[]) {
    const { defaultWidth, defaultHeight } = this;

    for (const pose of poses) {
      let points = pose.keypoints;

      const { angle, depth } = getAngle(points[5].x, points[6].x);
      if (!this.greenLight) {
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
  }
}

const game = new Game();
export default game;
