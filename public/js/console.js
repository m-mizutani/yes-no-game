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

var sounds = {};
var run_summary_flag = false;

$(document).ready(function() {
  sounds.se1 = new buzz.sound( "/audio/se1.mp3");
  sounds.se2 = new buzz.sound( "/audio/se2.mp3");
  sounds.se3 = new buzz.sound( "/audio/se3.mp3");

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
      sounds.se1.play();
      break;

    case 'start':
      console.log(ev.data);
      show_countdown(socket, ev.data.timeout);
      sounds.se1.stop();
      sounds.se2.play();
      break;

    case 'summary_resume':
      run_summary_flag = true;
      break;

    case 'voted':
      break;
    }
  });

  socket.on('result', function (msg) {
    sounds.se2.stop();
    console.log(msg);
    var correct = msg.correct;
    var p = [];
    for (var k in msg.score) {
      if (msg.result[k].answer === correct) {
        p.push({user: msg.users[k].name, ts: msg.result[k].ts,
               score: msg.score[k]});
      }
    }
    p.sort(function(a, b) { return a.ts - b.ts; });
    console.log(p);
    
    $('div#result ul#ranker').empty();
    $('span#correct').text('');
    $('div#result').animate({height: 'show'}, 1000);

    setTimeout(function() {
      $('span#correct').text(correct + ': ' + msg.q.c[correct]);
      sounds.se3.play();
      var ranker = p;
      var int_id = setInterval(function() {
        console.log(ranker);
        if (ranker.length > 0) {
          var u = ranker.pop();
          var li_id = 'rank_' + ranker.length;
          $('ul#ranker').prepend('<li id="' + li_id + '"></li>');
          $('li#' + li_id).text(Math.floor(u.ts / 100) / 10 + '秒: ' +
                                u.user + 'さん +' + 
                                u.score + '点');
          // $('li#' + li_id).fadeIn(1000);
          $('li#' + li_id).animate({height: 'show'});
        } else {
          clearInterval(int_id);
        }
      }, 200);
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
      $('meter#' + a).css('width', (summary[a] * 4) + 'px');
      // $('span.count#' + a).text(summary[a] + '人');
    }
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
    for (var k in msg.users) {
      p.push({user: msg.users[k].name, score: msg.users[k].score});
    }
    p.sort(function(a, b) { return b.score - a.score; });
    p = p.slice(0, 30);
    console.log(p);

    run_summary_flag = true;
    var int_id = setInterval(function() {
      if (run_summary_flag === false) {
        return ;
      }
      
      if (p.length > 0) {
        var rank = p.length;
        var li_id = 'rank_' + p.length;
        var u = p.pop();
        var name = (u.user === undefined ? '名無し' : u.user);
        var html = '<li id="' + li_id + '"></li>';
        var txt = rank + '位 ' + name + 'さん ' + u.score + '点';
            
        $('ul#ranking').prepend(html);
        $('li#' + li_id).text(txt);
        
        // $('li#' + li_id).fadeIn('slow');
        $('li#' + li_id).animate({height: 'show'});

        // 景品ない人枠だけ見せたところで一旦止める
        if (p.length === 13) {
          run_summary_flag = false;
        }
      } else {
        clearInterval(int_id);
      }
    }, 1000);
    
  });
});
