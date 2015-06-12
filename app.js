$(function(){
  axios.get('https://wwelves.org/perpetual-tripper/log/', {
    responseType: 'json'
  })
  .then(function(response) {
    console.log(response.data);
  });

  console.log('READY!');

  function enableEditor(){
    $('#editor button').attr('disabled', null);
    $('#editor textarea').attr('disabled', null);
  }

  function disableEditor(){
    $('#editor button').attr('disabled', 'disabled');
    $('#editor textarea').attr('disabled', 'disabled');
  }

  //debug
  window.app = {};
  window.app.enableEditor = enableEditor;
  window.app.disableEditor = disableEditor;
});
