const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('start-button');
const context = canvas.getContext('2d');

let model = null; // Global variable to store the model

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
    loadModel(); // Load model and start detection
  } catch (error) {
    console.error("Error accessing camera: ", error);
    statusElement.textContent = "Camera access denied or not supported on this device.";
  }
}

// Load COCO-SSD model
async function loadModel() {
  statusElement.textContent = 'Loading model...';
  model = await cocoSsd.load();
  statusElement.textContent = 'Model loaded. Detecting objects...';
  detectObjects(); // Start the detection loop
}

// Detection loop
function detectObjects() {
  model.detect(video).then(predictions => {
    renderPredictions(predictions);
    requestAnimationFrame(detectObjects); // Continue detecting
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

    // Calculate approximate distance (for demonstration)
    const distance = (1 / height * 1000).toFixed(2); // Placeholder for distance calculation
    const label = `${prediction.class} (${distance} cm)`;

    // Draw label and distance
    context.fillStyle = '#00FF00';
    context.font = '16px Arial';
    context.fillText(label, x, y > 10 ? y - 5 : 10);
  });
}

// Event listener for Start Camera button
startButton.addEventListener('click', setupCamera);
