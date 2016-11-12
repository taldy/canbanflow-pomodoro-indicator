(function () {

  var initialTime;
  var timerInterval;

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

  function onTimerStart(event) {
    let timerData = getTimerData();
    totalTime = getTotalTime(timerData);
    startTime = getStartTime(timerData);

    setTimeout(onTimerTick, 1);
  }

  function onTimerTick() {

    if (!isStarted()) {
      cancel();
      return;
    }

    if (isNaN(totalTime)) {
      synchroniseStopwatch(getCurrentTime());
    }
    else {
      synchronisePomodoro(getLeftTime(), totalTime);
    }

    setTimeout(onTimerTick, 1000);
  }

  function getTimerPrefix() {
    return '74f8c84159e0c0e3c274141ab887405b:dbf891a7cea312e5a3a363b650c94823';
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

  function synchronisePomodoro(left, total) {
    chrome.extension.sendMessage({action: 'pomodoroTick', left, total}, () => {});
  }

  function synchroniseStopwatch(current) {
    chrome.extension.sendMessage({action: 'stopwatchTick', current}, () => {});
  }

  function cancel() {
    chrome.extension.sendMessage({action: 'cancel'}, () => {});
  }

})();
