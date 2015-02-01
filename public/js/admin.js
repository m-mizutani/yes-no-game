$(document).ready(function() {
  var socket = io.connect(location.protocol + '//' + location.host);
/*
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
*/
  $('button.send_btn').click(function() {
    socket.emit('event', {name: 'setq', data: this.id});
  });
  $('#start_btn').click(function() {
    socket.emit('event', {name: 'start'});
  });
  $('#reset_btn').click(function() {
    console.log('reset');
    socket.emit('event', {name: 'reset'});
  });

});
