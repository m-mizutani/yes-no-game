function show_countdown(sock, remain) {  
  var int_id = setInterval(function() {
    $('#countdown').text('後' + remain + '秒');
    remain--;
    if (remain <= 0) {
      clearInterval(int_id);
      $('#countdown').text('終了');
      sock.emit('event', {name: 'end'});
    }
  }, 1000);
}

$(document).ready(function() {
  var socket = io.connect(location.protocol + '//' + location.host);
  socket.on('event', function (ev) {
    console.log(ev);
    switch (ev.name) {
    case 'setq':
      $('#question').text(ev.data);
      $('#countdown').text('');
      $('#result').text('');
      // socket.emit('my other event', { my: 'data' });
      break;

    case 'start':
      show_countdown(socket, 20);
      break;

    }
  });

  socket.on('result', function (msg) {
    var y_count = 0, n_count = 0;
    for (var k in msg) {
      switch(msg[k]) {
        case 'Yes': y_count += 1; break;
        case 'No':  n_count += 1; break;
      }      
    }

    $('#result').text('Yes: ' + y_count + '人, ' + 
                      'No: ' + n_count + '人');


    console.log(msg);
  });

});
