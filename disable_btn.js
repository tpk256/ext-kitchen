function waitForElement(selector, callback) {
  const el = document.querySelector(selector);
  if (el) return callback(el);

  const observer = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });


  observer.observe(document, { childList: true, subtree: true });
}





waitForElement('.button-blank-module__RQY8lW__buttonBlank.button-module__uO0Y7a__button.button-module__uO0Y7a__button_theme_1', 
    (btn) => {
    btn.disabled = true;
    console.log('Кнопка найдена и отключена');
    const url = new URL(window.location);
    
    fetch(
      `https://${window.location.hostname}/new/api/esb/complaint/list/${url.searchParams.get('uniqueId')}`
    ).then((resp) => resp.json).then(
      (data) => {
     
        console.log(data);
        btn.disabled = false;
        
      }
    )
});



