const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const statusElement = document.getElementById('status');
const startButton = document.getElementById('start-button');
const detectedTextElement = document.getElementById('detected-text');
const context = canvas.getContext('2d');

let model = null; // Global variable to store the object detection model
let isTextDetectionRunning = false; // Flag to prevent multiple concurrent OCR runs

// Function to set up the camera
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

// Load the object detection model and start detecting
async function loadModel() {
  statusElement.textContent = 'Loading models...';
  model = await cocoSsd.load();
  statusElement.textContent = 'Models loaded. Detecting objects and text...';
  detectObjects(); // Start detection loop
}

// Object detection loop with throttling
function detectObjects() {
  model.detect(video).then(predictions => {
    renderPredictions(predictions); // Render object predictions

    // Run text detection less frequently
    if (!isTextDetectionRunning) {
      isTextDetectionRunning = true;
      setTimeout(detectText, 2000); // Run OCR every 2 seconds
    }
  }).catch(error => {
    console.error("Object detection error:", error);
  });

  // Run object detection every 200ms to reduce load
  setTimeout(detectObjects, 200);
}

// Render object predictions on the canvas
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

    // Display label and estimated distance
    const distance = (1 / height * 1000).toFixed(2); // Placeholder distance calculation
    const label = `${prediction.class} (${distance} cm)`;
    context.fillStyle = '#00FF00';
    context.font = '16px Arial';
    context.fillText(label, x, y > 10 ? y - 5 : 10);
  });
}

// Run OCR to detect text from the video feed, throttled
function detectText() {
  Tesseract.recognize(video, 'eng')
    .then(({ data: { text } }) => {
      detectedTextElement.textContent = text.trim() || "No text detected.";
    })
    .catch(error => {
      console.error("Text detection error:", error);
      detectedTextElement.textContent = "Error detecting text.";
    })
    .finally(() => {
      isTextDetectionRunning = false; // Allow next text detection
    });
}

// Event listener for Start Camera button
startButton.addEventListener('click', setupCamera);
