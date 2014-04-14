/* Initialize a CamScan object.
 *
 * CamScan objects allow you to capture the current frame of a video steam,
 * process it, and extract the document in view, if any.
 *
 * Args:
 *   `video_element`: The name of the <video> element to bind to
 *   `scan_element`: Optional. The element to show scanned contents
 */
function CamScan(video_element, scan_element) {
  this.video = this.bindCameraToElement(video_element);
  this.scan = this.getOrCreateScanElement(scan_element);
}

/* Get or create a <canvas> for showing the scan
 *
 * Args:
 *   `name`: The name of the element to use
 */
CamScan.prototype.getOrCreateScanElement = function(name) {
  name = typeof name !== 'undefined' ? name : '_camscan_scan';
  var canvas = $(name);
  if (!canvas.length){
    // If the canvas doesn't exist, create it and make it hidden
    canvas = $("<canvas id='" + name + "' " +
               "width='" + this.video.width + "' " +
               "height='" + this.video.height + "' " +
               "style='display:none'></canvas>").appendTo("body");
  }
  canvas = canvas[0];
  return canvas;
}

/* Bind the webcam to a <video> element.
 *
 * Args:
 *   `element_name`: The name of the <video> element to bind to
 * Returns a reference to the bound element.
 */
CamScan.prototype.bindCameraToElement = function(element_name) {
  var video = $(element_name)[0],
      videoObj = { "video": true, "audio": false },
      errBack = function(error) {
          console.log("Video capture error: ", error); 
      };

  // Put video listeners into place
  if(navigator.getUserMedia) { // Standard
      navigator.getUserMedia(videoObj, function(stream) {
          video.src = stream;
          video.play();
      }, errBack);
  } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
      navigator.webkitGetUserMedia(videoObj, function(stream){
          video.src = window.webkitURL.createObjectURL(stream);
          video.play();
      }, errBack);
  }
  else if(navigator.mozGetUserMedia) { // Firefox-prefixed
      navigator.mozGetUserMedia(videoObj, function(stream){
          video.src = window.URL.createObjectURL(stream);
          video.play();
      }, errBack);
  }
  return video;
};

/* Copy an image from the video buffer to a canvas element
 *
 * Returns a reference to the canvas element containing the image
 */
CamScan.prototype.captureImage = function() {
  var context = this.scan.getContext("2d");
  context.drawImage(this.video, 0, 0, this.video.width, this.video.height);
  return context;
};

/* Draw an image to the scan element
 */
CamScan.prototype.putImage = function(image_data) {
  var context = this.scan.getContext("2d");
  context.putImageData(image_data, 0, 0);
  return context;
};

/* Extract the pixels from the captured image canvas
 *
 * Args:
 *   `canvas`: The canvas that contains image data
 * Returns image data // TODO wtf is "Image data"?
 */
CamScan.prototype.extractPixelsFromCanvas = function(canvas) {
  return canvas.getImageData(0, 0, this.video.width, this.video.height);
};

/* Extract a rectangle from the captured image.
 *
 * Returns the Document captured from the video.
 */
CamScan.prototype.extractDocument = function() {
  // First capture an image
  var canvas = this.captureImage();
  // Get the pixels
  var pixels = this.extractPixelsFromCanvas(canvas);
  // Convert to grayscale
  var grayscale = Filters.grayscale(pixels);

  // Get the average pixel intensity at the center of the image
  var center = [Math.floor(this.video.width / 2), Math.floor(this.video.height / 2)];
  var center_box = canvas.getImageData(
      center[0] - 10, center[1] - 10, center[0] + 10, center[1] + 10);
  var grayscale_box = Filters.grayscale(center_box);
  var sum = 0;
  for (var i = 0; i < grayscale_box.data.length; i++) {
    sum += grayscale_box.data[i];
  }
  var avg_intensity = sum / grayscale_box.data.length;
  console.log(avg_intensity);

  // Let's brighten the image
  var brightened = Filters.brightness(grayscale, 128 - avg_intensity);
  //this.putImage(brightened);

  // Then threshold the image
  var thresholded = Filters.threshold(brightened, 128);
  this.putImage(thresholded);
};
