Video = {}

/* Bind the webcam to a <video> element.
 *
 * Args:
 *   `video_element`: The name of the <video> element to bind to
 * Returns a reference to the bound element.
 */
Video.bindCameraToElement = function(video_element) {
  var video = $(video_element)[0],
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

/* Copy an image from the given video buffer to a canvas element
 *
 * Args:
 *   `video_element`: The <video> element to extract a frame from
 *   `canvas_element_name`: The name of the <canvas> to copy the image to.
 *     If none, a hidden one is created.
 * Returns a reference to the canvas element containing the image
 */
Video.captureImageToCanvas = function(video_element, canvas_element_name) {
  canvas_element_name = (
      typeof canvas_element_name !== 'undefined' ?
      canvas_element_name : '_camscan_scan');
  var canvas = $("#" + canvas_element_name);
  if (!canvas.length){
    // If the canvas doesn't exist, create it and make it hidden
    canvas = $("<canvas id='" + canvas_element_name + "' " +
               "width='" + video.width + "' " +
               "height='" + video.height + "' " +
               "style='display:none'></canvas>").appendTo("body");
  }
  canvas = canvas[0];

  var context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, video.width, video.height);
  return canvas;
};

/* Extract the <canvas> content as an image
 *
 * Args:
 *   `canvas`: The <canvas> to copy the image to.
 * Returns ImageData
 */
Video.getImageDataFromCanvas = function(canvas) {
  var context = canvas.getContext("2d");
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

/* Extract ImageData from the given video buffer
 *
 * Args:
 *   `video`: The <video> element to copy a frame from
 * Returns ImageData
 */
Video.getImageDataFromVideo = function(video) {
  return Video.getImageDataFromCanvas(Video.captureImageToCanvas(video_element));
};
