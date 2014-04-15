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
  this.video = Video.bindCameraToElement(video_element);
  this.temp_scan = this.getOrCreateCanvas("_cam_scan_temp_scan");
  this.temp_scan.style.display = "none";
  this.scan = this.getOrCreateCanvas(scan_element);
}

/* Get or create a <canvas>
 *
 * Args:
 *   `name`: The name of the element to use
 * Returns a reference to the <canvas>
 */
CamScan.prototype.getOrCreateCanvas = function(name) {
  name = typeof name !== 'undefined' ? name : '_camscan_scan';
  var canvas = $("#" + name);
  if (!canvas.length){
    // If the canvas doesn't exist, create it
    canvas = $("<canvas id='" + name + "' " +
               "width='" + this.video.width + "' " +
               "height='" + this.video.height + "' " +
               "></canvas>").appendTo("body");
  }
  canvas = canvas[0];
  return canvas;
}

/* Draw an image to the scan element
 */
CamScan.prototype.putImage = function(image_data) {
  var context = this.scan.getContext("2d");
  context.putImageData(image_data, 0, 0);
  return context;
};

/* Extract a rectangle from the captured image.
 *
 * Returns the Document captured from the video.
 */
CamScan.prototype.extractDocument = function() {
  // First capture an image
  var canvas = Video.captureImageToCanvas(this.video, this.temp_scan);
  // Get the pixels
  var pixels = Video.getImageDataFromCanvas(canvas);
  // Convert to grayscale
  var grayscale = Filters.grayscale(pixels);

  // Get the average pixel intensity at the center of the image
  var center = [Math.floor(this.video.width / 2), Math.floor(this.video.height / 2)];
  var center_box = canvas.getContext("2d").getImageData(
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
