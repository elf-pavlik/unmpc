$(function(){

  function getSpace(options) {
    if(options.url) {
      return spaces.filter(function(space){ return space.url === options.url; })[0];
    } else if(options.state) {
      return spaces.filter(function(space){ return space.state === options.state; })[0];
    }
  }

  function viewSpace(url) {
    // findOrCreateSpace()
    var space = getSpace({ url: url });
    if(!space) {
      space = { url: url };
      spaces.push(space);
      saveSpaces();
    }
    history.pushState(null, 'view', '?url=' + url) ;
    axios.get(space.url)
    .then(function(response) {
      var html = $.parseHTML(response.data);
      space.micropub = discoverMicropub(html);

      enablePersona();
      $('#editor').show();
      $('#space input').val(space.url);

      // FIXME get container in different way
      var items = microformats.getItems({ node: html[17] }).items;
      $('#wall ul').empty();
      items.forEach(function(item) {
        $('#wall ul').append('<li class="list-group-item"><div>' + item.properties.content + '</div><span>' + item.properties.published  + '</span> <span>' + item.properties.author  +  '</span></li>');
      });
    }).catch(function(error){ console.log(error); });
  }

  function saveSpaces() {
    console.log('save spaces ', spaces);
    localStorage.spaces = JSON.stringify(spaces);
  }

  function loadSpaces() {
    if(localStorage.spaces) {
      return JSON.parse(localStorage.spaces);
    } else {
      return null;
    }
  }

  function setPersona(persona) {
    if(persona) {
      $('#persona input').attr('placeholder', persona);
    }
  }

  function enablePersona(){
    $('#persona button').attr('disabled', false);
    $('#persona input').attr('disabled', false);
  }

  function disablePersona(){
    $('#persona button').prop('disabled', true);
    $('#persona input').prop('disabled', true);
  }

  function enableEditor(){
    $('#editor button').attr('disabled', false);
    $('#editor textarea').attr('disabled', false);
    $('#editor textarea').attr('placeholder', 'Enter your message...');
  }

  function disableEditor(){
    $('#editor button').prop('disabled', true);
    $('#editor textarea').prop('disabled', true);
    $('#editor textarea').attr('placeholder', 'Sign in to see if you can post on this wall...');
  }

  /*
   * @param url - string with body of web page (object)
   */
  function discoverMicropub(html){
    var links = $(html).filter(function(i, item){ return item.tagName === 'LINK' && item.getAttribute('rel') === 'micropub'; });
    if(links.length) {
      // FIXME handle multiple micropub endpoints
      return links[0].href;
    } else {
      return null;
    }
  }

  /*
   * @param url - micropub endpoint
   */
  function discoverAuthorization(url) {
    // FIXME perform real discovery
    return {
      authorization_endpoint: "https://indiecert.net/auth",
      token_endpoint: "https://indiecert.net/token"
    };
  }

  /*
   * options:
   *
   * url - authorization_endpoint
   * me - identity to authenticate
   * audience - uri of micropub endpoint
   */

  function redirectToAuthorize(options) {
    var space = getSpace({ url: $('#space input').val() });
    var state = String(Math.floor(Math.random() * 1000000000000000));
    space.state = state;
    saveSpaces();

    var query = 'client_id=' + client_id;
    query += '&redirect_uri=' + redirect_uri;
    query += '&me=' + options.me;
    query += '&audience=' + options.audience;
    // FIXME handle scopes
    query += '&scope=' + 'post';
    query += '&state=' + state;
    // FIXME save me
    // debug
    console.log('redirect', query);

    window.location = discoverAuthorization().authorization_endpoint + '?' + query;
  }

  /*
   * options:
   *
   * url - authorization_endpoint
   * me - authenticated identity
   * code - authorization code
   */
  function getAccessToken(options) {
    var space = getSpace({ state: options.state });
    var state = String(Math.floor(Math.random() * 1000000000000000));
    space.state = state;
    var query = 'code=' + options.code;
    query += '&client_id=' + client_id;
    query += '&redirect_uri=' + redirect_uri;
    query += '&me=' + options.me;
    query += '&state=' + state;
    axios.post(discoverAuthorization(space).token_endpoint, query, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'json'
    })
    .then(function(response){
      // TODO verify me
      // FIXME verify state
      // FIXME spaces[0] :(
      var space = getSpace({ state: state });
      console.log('authorized to access: ', space.url);
      space.token = response.data.access_token;
      delete space.state;
      saveSpaces();
      viewSpace(space.url);
      enableEditor();
    }).catch(function(error){ console.log(error); });
  }

  function postMessage(message) {
    var space = getSpace({ url: $('#space input').val() });
    // FIXME check if token available
    axios.post(space.micropub, 'h=entry&content=' + message, {
      headers: {
        'Authorization': 'Bearer ' + space.token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(function(response){
      console.log('published to', response.headers.location);
      viewSpace(space.url);
      $('#editor textarea').val('');
    }).catch(function(error){ console.log(error); });
  }

  // init
  console.log('READY!');

  // force HTTPS
  if(window.location.href.indexOf('https') !== 0) {
    window.location = window.location.href.replace('http', 'https');
  }
  var client_id = window.location.href.split('?')[0];
  var redirect_uri = client_id;

  // FIXME get initial space from config
  var spaces = loadSpaces();
  if(!spaces) {
    console.log('no spaces found, using default');
    spaces = [{ url: 'https://phubble.tuxed.net/just-testing/' }];
  }

  setPersona(localStorage.persona);

  $('#space button').on('click', function() {
    var url = $('#space input').val();
    console.log('view space', url);
    if(url) {
      console.log(url);
      viewSpace(url);
    } else {
      viewSpace(spaces[0].url);
    }
  });

  $('#persona button').on('click', function() {
    console.log('sign in');
    var me = $('#persona input').val();
    if(!me) me = localStorage.persona;
    if(me) {
      console.log('signing in:', me);
      redirectToAuthorize({ me: me, audience: getSpace({ url: $('#space input').val() }).micropub });
    } else {
      console.log('no identity provided');
    }
  });
  $('#editor button').on('click', function() {
    console.log('post');
    var message = $('#editor textarea').val();
    if(message) {
      postMessage(message);
    } else {
      console.log('no message to post');
    }
  });

  $('#editor').hide();
  disablePersona();

  var query = window.location.search;
  if(query) {
    // TODO use query-string parsing library
    var params = { };
    query.replace('?', '').split('&').forEach(function(pair){ pair = pair.split('='); params[pair[0]] = pair[1]; });
    // FIXME check me
    // FIXME check state
    // view
    if(params.url) {
      viewSpace(params.url);
    }
    // auth
    if(params.me) {
      console.log('authenticated as: ', params.me);
      localStorage.persona = params.me;
      enablePersona();
      $('#persona input').val(params.me);
      history.pushState(null, 'view', '?url=' + getSpace({ state: params.state }).url) ;
      getAccessToken(params);
    }
  }

  //debug
  window.app = {};
  window.app.spaces = spaces;
  window.app.enableEditor = enableEditor;
  window.app.disableEditor = disableEditor;
  window.app.discoverMicropub = discoverMicropub;
  window.app.discoverAuthorization = discoverAuthorization;
});
