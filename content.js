(function () {

  var timer;

  var totalTime, startTime;

  activate();

  ////////////////

  function activate() {
    registerPomodoroHandlers();
  }

  function registerPomodoroHandlers() {
    jQuery('body')
      .on('click', '.workTimerDialog-startButton', onTimerStart)
      .on('click', '.workTimerDialog-buttons-stacked .workTimerDialog-button', onTimerStart);
  }

  function onTimerStart() {
    setTimeout(startTimer, 10);
  }

  function startTimer() {
    if (!isStarted()) {
      sendCancel();
      return;
    }

    let timerData = getTimerData();
    totalTime = getTotalTime(timerData);
    startTime = getStartTime(timerData);

    if (isNaN(totalTime)) {
      sendStopwatchStart(getCurrentTime());
    }
    else {
      sendPomodoroStart(getLeftTime(), totalTime);
    }

    timer = Timer({
      delay: 1000,
      onTick: () => {
        if (!isStarted()) {
          sendCancel();
          timer.stop();
        }
      }
    });
    timer.start();
  }

  function getTimerPrefix() {
    let boardId = location.pathname.split('/board/')[1];

    let key = Object.keys(localStorage)
      .filter(key => key.indexOf(boardId + 'WorkTimerDialog:LastWorkUpdateTime') > 0)[0]
      .split(boardId + 'WorkTimerDialog:LastWorkUpdateTime')[0] + boardId;

    return key;
  }

  function getTimerData() {
    let data = false;
    try {
      data = JSON.parse(localStorage[getTimerPrefix() + 'WorkTimerSession:WorkEntry']);
    }
    catch (e) {}

    return data;
  }

  function getTotalTime(timerData) {
    return timerData ? timerData.workEntryDoc.targetWorkTimeMinutes * 60 : 0;
  }

  function getStartTime(timerData) {
    return timerData ? new Date(timerData.workEntryDoc.startTimestampLocal).getTime()/1000 : 0;
  }

  function getCurrentTime() {
    let current = localStorage[getTimerPrefix() + 'WorkTimerDialog:LastWorkUpdateTime'] / 1000;
    return Math.floor(current - startTime);
  }

  function getLeftTime() {
    return totalTime - getCurrentTime();
  }

  function isStarted() {
    return !!localStorage[getTimerPrefix() + 'WorkTimerSession:WorkEntry'];
  }

  function sendCancel() {
    chrome.extension.sendMessage({action: 'cancel'}, () => {});
  }

  function sendPomodoroStart(left, total) {
    chrome.extension.sendMessage({action: 'pomodoroStart', left, total}, () => {});
  }

  function sendStopwatchStart(current) {
    chrome.extension.sendMessage({action: 'stopwatchStart', current}, () => {});
  }

})();
