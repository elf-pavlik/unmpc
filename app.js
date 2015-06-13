$(function(){

  var space = { url: 'https://phubble.tuxed.net/just-testing/' };

  // FIXME get initial space from config
  axios.get(space.url)
  .then(function(response) {
    var html = $.parseHTML(response.data);
    // FIXME get container in different way
    var items = microformats.getItems({ node: html[13] }).items;
    items.forEach(function(item) {
      $('#wall ul').append('<li class="list-group-item"><div>' + item.properties.content + '</div><span>' + item.properties.published  + '</span> <span>' + item.properties.author  +  '</span></li>');
    });
  $('#editor').show();
  }).catch(function(error){ console.log(error); });

  console.log('READY!');

  function enableEditor(){
    $('#editor button').attr('disabled', null);
    $('#editor textarea').attr('disabled', null);
  }

  function disableEditor(){
    $('#editor button').attr('disabled', 'disabled');
    $('#editor textarea').attr('disabled', 'disabled');
  }

  // init
  $('#editor').hide();

  //debug
  window.app = {};
  window.app.enableEditor = enableEditor;
  window.app.disableEditor = disableEditor;
});
