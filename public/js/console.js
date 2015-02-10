function show_countdown(sock, remain) {
  remain *= 10;
  var int_id = setInterval(function() {
    $('#status').text('残り ' + Math.floor(remain / 10) + "." + (remain % 10) + '秒')    
    remain--;
    if (remain <= 0) {
      clearInterval(int_id);
      $('#status').text('終了！');
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
      $('#status').empty();
      $('div#result').css('display', 'none');
      
      $('#image').append('<img src="' + ev.data.img + '"/>');
      $('#question').text("問題 " + ev.data.q);
      for (var c in ev.data.c) {
        var choice = '<li id="' + c + '"><div class="c_title">' + c + ': ' +
            ev.data.c[c] +
            '</div><meter class="bar" id="' + c + '" value="1"></meter>' +
            '</li>';
        $('#choices').append(choice);
      }
      break;

    case 'start':
      show_countdown(socket, 60);
      break;
    }
  });

  socket.on('result', function (msg) {
    console.log(msg);
    var correct = msg.correct;
    var p = [];
    for (var k in msg.result) {
      if (msg.result[k].answer === correct) {
        p.push({user: msg.users[k].name, ts: msg.result[k].ts});
      }
    }
    p.sort(function(a, b) { return a.ts - b.ts; });
    console.log(p);
    
    $('div#result div#ranker').empty();
    $('span#correct').text('');
    $('div#result').animate({height: 'show'}, 1000);

    setTimeout(function() {
      $('span#correct').text(correct);
      var ranker = p.slice(0, 10);
      var int_id = setInterval(function() {
        console.log(ranker);
        if (ranker.length > 0) {
          var u = ranker.pop();
          var li_id = 'rank_' + ranker.length;
          $('ul#ranker').prepend('<li id="' + li_id + '">' +
                                 u.user + ': ' + u.ts / 1000 + '秒</li>');
          $('li#' + li_id).fadeIn(1000);
        } else {
          clearInterval(int_id);
        }
      }, 1000);
    }, 3000);
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
    $('meter').css('width', '0px');
    for (var a in summary) {
      $('meter#' + a).css('width', (summary[a] * 5) + 'px');
      // $('span.count#' + a).text(summary[a] + '人');
    }

    console.log(msg);
  });

});
