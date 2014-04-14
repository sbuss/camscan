CamScan = {};

/* CamScan */

/* Bind the webcam to a <video> element.
 *
 * Args:
 *   `element_name`: The name of the <video> element to bind to
 * Returns a reference to the bound element.
 */
CamScan.bindCameraToElement = function(element_name) {
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
 * Args:
 *   `video`: The video element
 *   `dest`: The target <canvas> element to copy the image into. If not
 *   supplied, a hidden canvas element will be created.
 * Returns a reference to the canvas element containing the image
 */
CamScan.captureImage = function(video, dest) {
  dest = typeof dest !== 'undefined' ? dest : '_camscan_canvas';
  var canvas = $(dest);
  if (!canvas.length){
    // If the dest doesn't exist, create it and make it hidden
    canvas = $("<canvas id='" + dest + "' " +
               "width='" + video.width + "' " +
               "height='" + video.height + "' " +
               "style='display:none'></canvas>").appendTo("body");
  }
  canvas = canvas[0];
  var context = canvas.getContext("2d");
  // TODO: Size shouldn't be hard-coded
  context.drawImage(video, 0, 0, 640, 480);
  return context;
};
