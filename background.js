(function () {

  const URL_PATTERN = "https://kanbanflow.com/*";
  const CANVAS_SIZE = 48;

  let lastTime;

  function activateKFTab() {
    chrome.tabs.query({url: URL_PATTERN}, tabs => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, {active: true});
      }
    });
  }



  chrome.browserAction.onClicked.addListener(activateKFTab);

  ///// Event handlers /////

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    const eventMap = {
      timerTick: onTimerTick
    };

    if (request.action && eventMap[request.action]) {
      eventMap[request.action](request, sender, sendResponse);
    }

    return true;
  });

  function onTimerTick(request, sender, sendResponse) {
    console.log('onTimerTick', request.initial, request.current);

    if (stringToSeconds(request.current) === 0) {
      setDefaultIcon();
      lastTime = null;
    }
    else if (request.current !== lastTime) {
      drawIcon(request.initial, request.current);
      lastTime = request.current;
    }
  }


  function _drawProgress(context, value, alarm) {
    context.beginPath();
    context.arc(CANVAS_SIZE/2,CANVAS_SIZE/2,CANVAS_SIZE/2-2, -0.5*Math.PI, 1.5*Math.PI);
    context.strokeStyle = '#ddd';
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();
    context.arc(CANVAS_SIZE/2,CANVAS_SIZE/2,CANVAS_SIZE/2-2, -0.5*Math.PI, (2 * value - 0.5)*Math.PI);
    context.strokeStyle = alarm ? 'red' : '#888';
    context.lineWidth = 2;
    context.stroke();
  }

  function _drawTime(context, value, alarm = false) {
    context.font="30px Arial";
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle = alarm ? 'red' : "#888";
    context.fillText(value, CANVAS_SIZE/2, CANVAS_SIZE/2);
  }

  function _updateExtensionIcon(context) {
    var imageData = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    chrome.browserAction.setIcon({
      imageData: imageData
    });
  }

  function _getCanvasContext() {
    var canvas = document.createElement('canvas');
    canvas.id     = "CursorLayer";
    canvas.width  = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    return canvas.getContext("2d");
  }

  function stringToSeconds(time) {
    let [mins, secs] = time.split(':');
    mins = parseInt(mins, 10);
    secs = parseInt(secs, 10);

    return mins * 60 + secs;
  }

  function drawIcon(initial, current) {

    let initialSeconds = stringToSeconds(initial);
    let currentSeconds = stringToSeconds(current);
    let alarm = currentSeconds <= 60;

    let context = _getCanvasContext();

    _drawProgress(context, currentSeconds / initialSeconds, alarm);
    _drawTime(context, currentSeconds > 60 ? Math.floor(currentSeconds / 60) : currentSeconds, alarm);

    _updateExtensionIcon(context);
  }

  function setDefaultIcon() {
    chrome.browserAction.setIcon({
      path: "icons/icon48.png"
    });
  }

  //var i = 61;
  //drawIcon('00:60', '00:' + i);
  //
  //var www = setInterval(() => {
  //  i--;
  //  drawIcon('00:60', '00:' + i);
  //
  //  if (i <= 0) {
  //    clearInterval(www);
  //    www = null;
  //
  //    setDefaultIcon();
  //
  //    return;
  //  }
  //
  //}, 1000);

})();
