(function () {

  var initialTime;
  var timerInterval;

  activate();

  ////////////////

  function activate() {
    console.log('this is a content.js #2', jQuery);
    registerPomodoroHandlers();
  }

  function registerPomodoroHandlers() {

    //document.querySelector('.workTimerDialog-startButton').addEventListener();
    jQuery('body').on('click', '.workTimerDialog-startButton', onTimerStart);

  }
  
  function onTimerStart(event) {
    console.log('onPomodoroStart', event);

    initialTime = getTimerClockText();

    //onTimerTick();

    setTimeout(onTimerTick, 1);
  }

  function onTimerEnd() {

  }

  function onTimerTick() {

    if (!isStarted()) {
      //clearInterval(timerInterval);
      //timerInterval = null;
      //onTimerEnd();

      if (initialTime) {
        synchronise('00:00', initialTime);
      }
      return;
    }

    synchronise(getTimerClockText(), initialTime);
    setTimeout(onTimerTick, 700);
  }

  function getTimerClockText() {
    return jQuery('.workTimerDialog-clockText').text();
  }

  function isStarted() {
    return !!jQuery('#workTimerDialog:visible .workTimerDialog-stopButton:visible').length;
  }

  function isActive() {
    return !!jQuery('#workTimerDialog:visible').length;
  }

  function synchronise(current, initial) {
    console.log('synchronise', current, initial);
    chrome.extension.sendMessage({action: 'timerTick', current, initial}, () => {});
  }

})();
