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

  poses: poseDetection.Pose[] = [];
  snapshot: { [key: number]: poseDetection.Pose } = {};

  constructor() {}

  takeSnapshot() {
    this.snapshot = {};
    for (const pose of this.poses) {
      if (!pose.id) continue;
      this.snapshot[pose.id] = JSON.parse(JSON.stringify(pose));
    }
  }

  checkThreshold() {
    if (this.greenLight || !Object.keys(this.snapshot).length) return;

    for (let id in this.snapshot) {
      const pose = this.snapshot[id];
      const newPose = this.poses.find((p) => p.id === pose.id);

      if (!newPose) continue;

      for (let i = 0; i < 1; i++) {
        const oldPoint = pose.keypoints[i];
        const newPoint = newPose.keypoints[i];

        const { depth } = getAngle(pose.keypoints[5].x, pose.keypoints[6].x);

        const dist = Math.sqrt(Math.pow(oldPoint.x - newPoint.x, 2) + Math.pow(oldPoint.y - newPoint.y, 2));

        console.log(oldPoint.name, newPoint.name, dist, depth);
      }
    }
  }

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

    this.poses = await this.detector.estimatePoses(this.video);

    this.checkThreshold();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawPoses(ctx, canvas);

    // Draw stats
    drawText(ctx, "FPS: " + Math.round(10000 / (window as any).delta) / 10, 10, 30, undefined, "white", "left", "top");
    drawText(ctx, "# of poses: " + this.poses.length, 10, 60, undefined, "white", "left", "top");
  }

  drawPoses(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const { defaultWidth, defaultHeight } = this;

    for (const pose of this.poses) {
      let points = pose.keypoints;

      const { angle, depth } = getAngle(points[5].x, points[6].x);
      if (!this.greenLight) {
        socket.emit("angle", angle);
      }

      const joints: { [key: string]: any } = {};

      // Convert points to body joints
      for (const p of points) {
        if (!p.name) continue;
        const id = p.name;

        const sx = (canvas.width - p.x - (canvas.width - defaultWidth)) * (canvas.width / defaultWidth);
        const sy = p.y * (canvas.height / defaultHeight);

        if (joints[id]) {
          joints[id].x = sx;
          joints[id].y = sy;
        } else {
          joints[id] = Ola({ x: sx, y: sy }, 50);
        }
      }

      // Draw joints
      drawPose(ctx, joints, depth);
    }
  }
}

const game = new Game();
(globalThis as any).game = game;
export default game;
