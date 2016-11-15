(function () {

  const URL_PATTERN = "https://kanbanflow.com/*";
  const CANVAS_SIZE = 48;

  let time;
  let timer;
  let lastTime;
  let cancelTimer;
  let cancelTimeout = 10000;

  function activateKFTab() {
    chrome.tabs.query({url: URL_PATTERN}, tabs => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, {active: true});
      }
    });
  }

  function _drawProgress(context, value, alarm) {
    //context.beginPath();
    //context.arc(CANVAS_SIZE/2,CANVAS_SIZE/2,CANVAS_SIZE/2-2, -0.5*Math.PI, 1.5*Math.PI);
    //context.strokeStyle = '#ddd';
    //context.lineWidth = 2;
    //context.stroke();

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

  function setDefaultIcon() {
    chrome.browserAction.setIcon({
      path: "icons/icon64_grey.png"
    });
  }

  chrome.browserAction.onClicked.addListener(activateKFTab);

  ///// Event handlers /////

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    const eventMap = {
      pomodoroTick: onPomodoroTick,
      stopwatchTick: onStopwatchTick,
      pomodoroStart: onPomodoroStart,
      stopwatchStart: onStopwatchStart,
      cancel: onCancel
    };

    if (request.action && eventMap[request.action]) {
      eventMap[request.action](request, sender, sendResponse);
    }

    return true;
  });

  function onPomodoroTick(request) {
    let {left, total} = request;

    let absLeft = Math.abs(left);
    let uniqValue = absLeft > 60 ? Math.floor(absLeft / 10) : absLeft;

    if (uniqValue !== lastTime) {
      let alarm = left <= 60;

      let context = _getCanvasContext();
      _drawProgress(context, left > 0 ? left / total : 1, alarm);
      _drawTime(context, absLeft > 60 ? Math.floor(absLeft / 60) : absLeft, alarm);
      _updateExtensionIcon(context);

      lastTime = uniqValue;
    }

    clearTimeout(cancelTimer);
    cancelTimer = setTimeout(onCancel, cancelTimeout);
  }

  function onStopwatchTick(request) {
    let {current} = request;

    let value = current >= 60 ? Math.floor(current / 60) : current;

    if (value !== lastTime) {
      let context = _getCanvasContext();
      _drawProgress(context, 1);
      _drawTime(context, value);
      _updateExtensionIcon(context);

      lastTime = value;
    }
  }

  function onPomodoroStart(request) {
    time = request.total;

    onPomodoroTick(request);
    //timer = setInterval(() => {
    //
    //  time--;
    //  onPomodoroTick({total: request.total, left: time});
    //
    //
    //}, 1000);

    timer = Timer({
      delay: 1000,
      onTick: () => {
        time--;
        onPomodoroTick({total: request.total, left: time});
      }
    });
    timer.start();
  }

  function onStopwatchStart(request) {
    time = 0;

    onStopwatchTick({current: time});
    //timer = setInterval(() => {
    //  time++;
    //  onStopwatchTick({current: time});
    //
    //}, 1000);
    timer = Timer({
      delay: 1000,
      onTick: () => {
        time++;
        onStopwatchTick({current: time});
      }
    });
    timer.start();
  }

  function onCancel() {
    setDefaultIcon();
    //clearInterval(timer);
    //timer = null;

    timer && timer.stop();
    time = 0;
  }

})();
