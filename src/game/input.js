// Shared input state for the 3D world.
// Reads by the Player in useFrame; written by VirtualJoystick & mobile buttons.
export const touchInput = {
  move: { x: 0, y: 0 }, // joystick [-1,1]
  run: false,
  jump: false,
  interact: false,
};

export function setTouchInput(patch) {
  Object.assign(touchInput, patch);
}
