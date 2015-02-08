function show_countdown(sock, remain) {
  remain *= 10;
  var int_id = setInterval(function() {
    $('#countdown').text('後 ' + Math.floor(remain / 10) + "." + (remain % 10) + '秒')    
    remain--;
    if (remain <= 0) {
      clearInterval(int_id);
      $('#countdown').text('終了');
      sock.emit('event', {name: 'end'});
    }
  }, 100);
}

$(document).ready(function() {
  var socket = io.connect(location.protocol + '//' + location.host);
  socket.on('event', function (ev) {
    console.log(ev);
    switch (ev.name) {
    case 'setq':
      $('#image').empty();
      $('#choices').empty();
      $('ul#result').empty();
      $('#countdown').empty();

      $('#image').append('<img src="' + ev.data.img + '"/>');
      $('#question').text("問題 " + ev.data.q);
      for (var c in ev.data.c) {
        $('#choices').append('<li id="' + c + '">' + c + ': ' +
                             ev.data.c[c] + ' <span class="count" id="' + c + '"></span></li>');
      }
      // socket.emit('my other event', { my: 'data' });
      break;

    case 'start':
      show_countdown(socket, 60);
      break;
    }
  });

  socket.on('result', function (msg) {
    console.log(msg);
    var c = msg.correct;
    var p = [];
    for (var k in msg.result) {
      if (msg.result[k].answer === c) {
        p.push({user: k, ts: msg.result[k].ts});
      }
    }
    p.sort(function(a, b) { return a.ts - b.ts; });
    console.log(p);
    $('ul#result').empty();
    for (var i = 0; i < p.length; i++) {
      $('ul#result').append('<li>' + p[i].user + ': ' + p[i].ts / 1000 + '秒</li>');
    }
  });
  
  socket.on('update', function (msg) {
    var summary = {};
    for (var k in msg) {
      var ans = msg[k].answer;
      if (summary[ans] === undefined) {
        summary[ans] = 0;
      }
      summary[ans] += 1;
    }

    var txt = [];
    $('span.count').text('');
    for (var a in summary) {
      $('span.count#' + a).text(summary[a] + '人');
    }

    console.log(msg);
  });

});
