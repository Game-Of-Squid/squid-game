export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font?: string | Object,
  color?: string,
  align?: string,
  baseline?: string,
  alpha?: number
) {
  let options: { [key: string]: any } = {};
  if (font instanceof Object) {
    options = font;
  }
  ctx.beginPath();
  ctx.font = options.font || font || "20px Arial";
  ctx.fillStyle = options.color || color || "red";
  ctx.textAlign = options.align || align || "default";
  ctx.globalAlpha = alpha || 1;
  ctx.textBaseline = options.baseline || baseline || "default";
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
  ctx.closePath();
}

export function drawCircle(
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
  if (options.fill || options.fill === undefined) ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = options.outlineWidth || 1;
  ctx.strokeStyle = options.outlineColor || "black";
  if (options.outline) ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

export function drawLine(
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

export function drawPose(ctx: CanvasRenderingContext2D, joints: any, depth: number) {
  // SKELETON
  let nose = {
    x: joints["nose"].x,
    y: joints["nose"].y,
  };

  let neck = {
    x: (joints["left_shoulder"].x + joints["right_shoulder"].x) / 2,
    y: (joints["left_shoulder"].y + joints["right_shoulder"].y) / 2,
  };

  let dick = {
    x: (joints["left_hip"].x + joints["right_hip"].x) / 2,
    y: (joints["left_hip"].y + joints["right_hip"].y) / 2,
  };

  let knee = {
    x: (joints["left_knee"].x + joints["right_knee"].x) / 2,
    y: (joints["left_knee"].y + joints["right_knee"].y) / 2,
  };

  let foot = {
    x: (joints["left_ankle"].x + joints["right_ankle"].x) / 2,
    y: (joints["left_ankle"].y + joints["right_ankle"].y) / 2,
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

  drawLine(ctx, joints["left_shoulder"].x, joints["left_shoulder"].y, joints["right_shoulder"].x, joints["right_shoulder"].y, "lime", 4);
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
  }

  drawCircle(ctx, neck.x, neck.y, 5);
  drawCircle(ctx, dick.x, dick.y, 5);
  drawCircle(ctx, knee.x, knee.y, 5);
  drawCircle(ctx, foot.x, foot.y, 5);

  drawLine(ctx, nose.x, nose.y, neck.x, neck.y, "white", 8);
  drawLine(ctx, neck.x, neck.y, dick.x, dick.y, "white", 8);
  drawLine(ctx, dick.x, dick.y, knee.x, knee.y, "white", 8);
  drawLine(ctx, knee.x, knee.y, foot.x, foot.y, "white", 8);

  drawText(ctx, Math.round(depth) + " cm", nose.x, nose.y + 10 - 20 / (depth / 100), undefined, "aqua", "center");
}
