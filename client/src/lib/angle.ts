export const getAngle = (lShoulder: number, rShoulder: number): number => {
  const xCenter: number = 300;
  const fullWidth: number = 600;

  const shoulderDist: number = lShoulder - rShoulder;
  const shoulderMiddle: number = (lShoulder + rShoulder) / 2;

  let depth: number = 67544 * Math.pow(Math.abs(shoulderDist), -1.31);

  const avgShoulder: number = 35;

  const distFromMiddle: number = ((xCenter - shoulderMiddle) / shoulderDist) * avgShoulder;

  const angle: number = Math.atan(distFromMiddle / depth) * (180 / Math.PI);

  return angle;
};
