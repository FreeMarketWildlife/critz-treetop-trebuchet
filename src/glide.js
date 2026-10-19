/**
 * 2D still-air, quasi-steady membrane aerodynamics, x right / y up, radians.
 * Coefficients are explicit gameplay tuning, not measured squirrel biology.
 * Input +1 (right) reduces membrane incidence to dive; -1 increases it to flare.
 * A flare trades speed for height; there is no thrust. This helper applies no
 * pitch motor: torque is zero. Incidence represents ideal massless membrane
 * deflection; actual articulated pitch changes must be separately accounted.
 */
export const GLIDE_DEFAULTS = Object.freeze({
  airDensity: 1.225, liftSlope: 4, maxLiftCoefficient: 1.1,
  zeroLiftDrag: .12, inducedDrag: .12, broadsideDrag: 1.1,
  incidence: .10, controlIncidence: .22, stallAngle: .42,
  maxAcceleration: 35, maxSpeed: 100,
});
const bounded = (n, lo, hi, fallback = lo) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : fallback));
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
export function aerodynamicForces({ vx, vy, mass, area, pitch = 0, input = 0 }, options = {}) {
  if (![vx, vy, mass, area, pitch, input].every(Number.isFinite) || mass <= 0 || area < 0)
    throw new RangeError('Finite velocity, pitch and input; positive mass and nonnegative area required');
  const p = { ...GLIDE_DEFAULTS, ...options };
  for (const key of Object.keys(GLIDE_DEFAULTS)) if (!Number.isFinite(p[key])) throw new RangeError(`Invalid aerodynamic parameter: ${key}`);
  if (p.airDensity < 0 || p.liftSlope < 0 || p.maxLiftCoefficient < 0 || p.zeroLiftDrag < 0 || p.inducedDrag < 0 || p.broadsideDrag < 0 || p.stallAngle <= 0 || p.maxAcceleration <= 0 || p.maxSpeed <= 0)
    throw new RangeError('Aerodynamic losses and density must be nonnegative; limits must be positive');
  const speed = Math.hypot(vx, vy);
  if (!Number.isFinite(speed)) throw new RangeError('Velocity magnitude overflow');
  const control = bounded(input, -1, 1), flowAngle = Math.atan2(vy, vx);
  // Symmetric wing: reverse flight is handled by sin(2 alpha), rather than
  // forcing lift upward independently of actual airflow/body orientation.
  const alpha = wrap(pitch - flowAngle + p.incidence - control * p.controlIncidence);
  const sinAlpha = Math.sin(alpha);
  const attached = Math.exp(-Math.pow(Math.abs(Math.sin(alpha)) / Math.sin(Math.min(p.stallAngle, Math.PI / 2)), 4));
  const clAttached = bounded(p.liftSlope * Math.sin(2 * alpha) / 2, -p.maxLiftCoefficient, p.maxLiftCoefficient);
  const cl = clAttached * attached;
  const cd = p.zeroLiftDrag + p.inducedDrag * cl * cl + p.broadsideDrag * sinAlpha * sinAlpha;
  const dynamicPressure = .5 * p.airDensity * Math.min(speed, p.maxSpeed) ** 2;
  let lift = dynamicPressure * area * cl, drag = dynamicPressure * area * cd;
  // Uniform scaling preserves direction and nonpositive translational work.
  const rawForce = Math.hypot(lift, drag), forceLimit = mass * p.maxAcceleration;
  const forceScale = Math.min(1, forceLimit / (rawForce || 1));
  if (![lift, drag, rawForce, forceLimit].every(Number.isFinite)) throw new RangeError('Aerodynamic force magnitude overflow');
  lift *= forceScale; drag *= forceScale;
  const ux = speed ? vx / speed : 0, uy = speed ? vy / speed : 0;
  const fx = -drag * ux - lift * uy, fy = -drag * uy + lift * ux;
  const translationalPower = -drag * speed;
  if (![fx, fy, translationalPower].every(Number.isFinite)) throw new RangeError('Aerodynamic power magnitude overflow');
  return {
    fx, fy, torque: 0,
    power: translationalPower,
    diagnostic: { speed, alpha, lift, drag, liftCoefficient: cl, dragCoefficient: cd,
      translationalPower, actuatorPower: 0, dynamicPressure,
      forceLimited: forceScale < 1, speedLimited: speed > p.maxSpeed,
      inputLimited: control !== input, stalled: Math.abs(Math.sin(alpha)) > Math.sin(Math.min(p.stallAngle, Math.PI / 2)),
      // Guidance only, not a motor or direct velocity assignment.
      targetPitch: wrap(flowAngle - p.incidence - control * p.controlIncidence + .12),
    },
  };
}
