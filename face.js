const video = document.querySelector("#video");
const stop = document.getElementById("stop");
const start = document.getElementById("start");
const canvas = document.querySelector("canvas");
stop.addEventListener("click", () => stopCam());
start.addEventListener("click", () => startCam());

displaySize = { width: video.width, height: video.height };
faceapi.matchDimensions(canvas, displaySize);
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]);

function startCam() {
  navigator.getUserMedia(
    { video: { frameRate: { max: 60 } } },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

startCam();

function stopCam() {
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
  }
  setInterval(() => {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }, 1);
}

video.addEventListener("play", () => {
  setInterval(async () => {
    const detection = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetection = faceapi.resizeResults(detection, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetection);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetection, 0.05);
  }, 1);
});
