(function () {

  var initialTime;
  var timerInterval;

  var totalTime, startTime;

  activate();

  ////////////////

  function activate() {
    console.log('this is a content.js #2', jQuery);
    registerPomodoroHandlers();
  }

  function registerPomodoroHandlers() {
    jQuery('body')
      .on('click', '.workTimerDialog-startButton', onTimerStart)
      .on('click', '.workTimerDialog-buttons-stacked .workTimerDialog-button', onTimerStart);
  }

  function onTimerStart(event) {
    console.log('onPomodoroStart', event);

    //initialTime = getTimerClockText();
    //setTimeout(onTimerTick, 1);
    let timerData = getTimerData();
    totalTime = getTotalTime(timerData);
    console.log('totalTime', totalTime);
    startTime = getStartTime(timerData);
    console.log('startTime', startTime);

    setTimeout(onTimerTick, 1);
  }

  function onTimerEnd() {

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

    console.log('getTimerData', Object.assign({}, data));
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

  function getClockElement() {
    let mainClock = jQuery('#workTimerDialog:visible .workTimerDialog-clockText');
    let smallClock = jQuery('.toolbar-timerButton-hasClockText .toolbar-button-text');

    return mainClock.length ? mainClock : smallClock;
  }

  function getTimerClockText() {
    return getClockElement().text();
  }

  function isStarted() {
    return !!localStorage[getTimerPrefix() + 'WorkTimerSession:WorkEntry'];
  }

  function isActive() {
    return !!jQuery('#workTimerDialog:visible').length;
  }

  function synchronisePomodoro(left, total) {
    console.log('synchronisePomodoro', left, total);
    chrome.extension.sendMessage({action: 'pomodoroTick', left, total}, () => {});
  }

  function synchroniseStopwatch(current) {
    console.log('synchroniseStopwatch', current);
    chrome.extension.sendMessage({action: 'stopwatchTick', current}, () => {});
  }

  function cancel() {
    console.log('cancel');
    chrome.extension.sendMessage({action: 'cancel'}, () => {});
  }

  //
  // .toolbar-timerButton-hasClockText .toolbar-button-text

})();
