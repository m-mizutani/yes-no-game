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
      switch_content('main');
      $('#image').empty();
      $('#choices').empty();
      $('ul#result').empty();
      
      $('#image').append('<img src="' + ev.data.img + '"/>');
      $('#question').text(ev.data.q);
      for (var c in ev.data.c) {
        var choice = '<li id="' + c + '"><div class="c_title">' + c + ': ' +
            ev.data.c[c] +
            '</div><meter class="bar" id="' + c + '" value="1"></meter>' +
            '</li>';
        $('#choices').append(choice);
      }
      break;

    case 'start':
      console.log(ev.data);
      show_countdown(socket, ev.data.timeout);
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
    
    $('div#result ul#ranker').empty();
    $('span#correct').text('');
    $('div#result').animate({height: 'show'}, 1000);

    setTimeout(function() {
      $('span#correct').text(correct + ': ' + msg.q.c[correct]);
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

  function switch_content(content) {
    $('div.content').addClass('hide');
    $('div.content#' + content).removeClass('hide');
    $('div#result').css('display', 'none');
    $('#status').empty();
  }
    
  socket.on('summary', function(msg) {
    console.log(msg);
    $('ul#ranking').empty();
    switch_content('score');

    var p = [];
    for (var k in msg.score) {
      p.push({user: msg.users[k].name, score: msg.score[k]});
    }
    p.sort(function(a, b) { return b.score - a.score; });
    p.slice(0, 20);
    console.log(p);

    var int_id = setInterval(function() {
      if (p.length > 0) {
        var rank = p.length;
        var li_id = 'rank_' + p.length;
        var u = p.pop();
        var name = (u.user === undefined ? '名無しさん' : u.user);
        var html = '<li id="' + li_id + '">' +
            rank + '位 ' + name + ' ' + u.score + '点</li>';
        $('ul#ranking').prepend(html);
        // $('li#' + li_id).fadeIn('slow');
        $('li#' + li_id).animate({height: 'show'});
      } else {
        clearInterval(int_id);
      }
    }, 1000);
    
  });
});
