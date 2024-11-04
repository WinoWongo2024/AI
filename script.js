const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('start-button');
const detectionHistory = document.getElementById('detection-history');
const context = canvas.getContext('2d');

// Utility function to add detection to history
function addToDetectionHistory(label, distance) {
  const listItem = document.createElement('li');
  listItem.textContent = `${label} - ${distance.toFixed(2)} cm`;
  detectionHistory.prepend(listItem);
  if (detectionHistory.children.length > 10) { // Keep the last 10 detections
    detectionHistory.removeChild(detectionHistory.lastChild);
  }
}

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

// Detect objects every few frames to reduce load
function detectFrame(video, model) {
  model.detect(video).then(predictions => {
    renderPredictions(predictions);
    setTimeout(() => detectFrame(video, model), 500); // Process every 500 ms
  });
}

// Render predictions with bounding boxes, labels, and history
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

    // Calculate approximate distance (for demonstration)
    const distance = 1 / prediction.bbox[3] * 1000; // Adjust based on object size
    const label = `${prediction.class} (${distance.toFixed(2)} cm)`;

    // Draw label and distance
    context.fillStyle = '#00FF00';
    context.font = '16px Arial';
    context.fillText(label, x, y > 10 ? y - 5 : 10);

    // Update detection history
    addToDetectionHistory(prediction.class, distance);
  });
}

// Event listener for Start Camera button
startButton.addEventListener('click', setupCamera);
