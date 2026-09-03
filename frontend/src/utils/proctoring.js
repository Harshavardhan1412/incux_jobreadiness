// Shared holder for the live proctoring media stream.
// Keeps the camera + mic stream alive across the proctoring setup and the exam,
// so the camera/indicator stays on during the whole assessment.
let currentStream = null;

export function setProctoringStream(stream) {
  currentStream = stream;
}

export function getProctoringStream() {
  return currentStream;
}

export function stopProctoringStream() {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
    currentStream = null;
  }
}

export function isProctoringActive() {
  return !!currentStream && currentStream.getTracks().some((t) => t.readyState === 'live');
}
