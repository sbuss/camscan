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
