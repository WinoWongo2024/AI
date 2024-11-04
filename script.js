const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('start-button');
const context = canvas.getContext('2d');

// Function to set up camera
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await new Promise(resolve => (video.onloadedmetadata = resolve));
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    video.style.display = 'block';
    canvas.style.display = 'block';
    startButton.style.display = 'none'; // Hide start button
    loadModelAndDetect(); // Load model and start detection
  } catch (error) {
    console.error("Error accessing camera: ", error);
    statusElement.textContent = "Camera access denied or not supported on this device.";
  }
}

// Load COCO-SSD model and start detection
async function loadModelAndDetect() {
  statusElement.textContent = 'Loading model...';
  const model = await cocoSsd.load();
  statusElement.textContent = 'Model loaded. Detecting objects...';

  detectFrame(video, model);
}

// Detect objects in each frame
function detectFrame(video, model) {
  model.detect(video).then(predictions => {
    renderPredictions(predictions);
    requestAnimationFrame(() => detectFrame(video, model));
  });
}

// Render predictions with bounding boxes and labels
function renderPredictions(predictions) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];

    // Draw bounding box
    context.strokeStyle = '#00FF00';
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);

    // Draw label and distance estimation
    const label = `${prediction.class} (${(1 / prediction.bbox[3] * 1000).toFixed(2)} cm)`; // Placeholder for distance
    context.fillStyle = '#00FF00';
    context.font = '16px Arial';
    context.fillText(label, x, y > 10 ? y - 5 : 10);
  });
}

// Event listener for Start Camera button
startButton.addEventListener('click', setupCamera);
