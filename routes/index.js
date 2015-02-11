var express = require('express');
var msgpack = require('msgpack');
var fs = require('fs');

var router = express.Router();

var socketio;
var answer_buf;
var current_q;
var start_ts;
var basic_score = 40;
var bonus_score = 60;
var quiz_timeout = 10.0;


function event_handler(msg) {
  console.log(msg);
  switch(msg.name) {
  case 'result':
    socketio.sockets.emit('result', {result: answer_buf, users: users,
                                     correct: current_q.a,
                                     q: current_q});
    return false;
    
  case 'end':
    if (start_ts === undefined) {
      console.log('invalid end event');
      return false;
    }
    
    var score_board = {};
    for (k in answer_buf) {
      if(score_board[k] === undefined) {
        score_board[k] = 0;
      }
      var rec = answer_buf[k];
      if (rec.answer === current_q.a) {
        var ts = Math.min(rec.ts/1000, quiz_timeout);
        var br = (quiz_timeout - ts) / quiz_timeout;
        console.log(br);
        score_board[k] = (basic_score + bonus_score * br);
        score_board[k] = Math.floor(score_board[k] * 10) / 10;

        // Apply score ratio option.
        if (current_q.ratio !== undefined) {
          score_board[k] *= current_q.ratio;
        }
        users[k].score += score_board[k];
        users[k].score = Math.floor(users[k].score * 10) / 10;
      }
    }
    console.log(score_board);
    start_ts = undefined;
    dump_userdata();

    // Automatically send event to show result.
    setTimeout(function() {
      socketio.sockets.emit('result', {result: answer_buf, users: users,
                                       correct: current_q.a, score: score_board,
                                       q: current_q});
    }, 2000);
    
    // Send refresh to client.
    setTimeout(function() {
      socketio.sockets.emit('event', {name: 'reload-client'});
    }, 10000);
    return false;

  case 'setq':
    reset_data(); 
    current_q = questions[msg.data];
    current_q.qid = msg.data;
    socketio.sockets.emit('event', {name: 'setq',
                                    data: questions[msg.data]});
    socketio.sockets.emit('event', {name: 'reload-client'});
    return false;

  case 'start':
    start_ts = new Date().getTime();
    var d = {timeout: quiz_timeout};
    socketio.sockets.emit('event', {name: 'start',
                                    data: d});
    return false;

  case 'reset':
    reset_score();
    return false;

  case 'summary':
    socketio.sockets.emit('summary', {score: score_board,
                                      users: users});
    return false;
  }

  return true;
}

router.set_socket = function(s) {
  socketio = s;
  socketio.on('connection', function (socket) {
    // socket.emit('cmd', { hello: 'world' });
    socket.on('event', function (msg) {
      if (event_handler(msg)) {
        console.log('send event');
        socketio.sockets.emit('event', msg);
      }
    });
  });

};

var questions = {
  q0: {q: '今年のバレンタインはいかがでしたか？',
       c: {A: 'チョコをあげた人',
           B: 'チョコをもらった人',
           C: 'これから何かする人' ,
           D: 'バレンタインなど関係ない人'},
       a: 'D',
       img: 'http://heiasetarrow.com/wp-content/uploads/2015/02/3D-Happy_Valentines_Day_theme_desktop_wallpaper_medium.jpg',
      },
    q1: {
      q: '問1 去年のバレンタインになつかさんがしょうた君にあげたものは！？',
    c: {A: 'ラーメン', B: '自転車', C: '温泉旅行' , D: '香水'},
    a: 'D',
    img: '/images/q1.jpg',
    },

    q2: {q: '問2 これまでに二人が自転車で走ってきた総走行距離は何キロか？',
    c: {A: '42km', B: '250km', C: '1430km', D: '40075km'},
    a: 'C',
    img: '/images/q2.jpg',
    },
  q3: 
    {q: '問3 しょうた君のプロポーズの言葉は？',
     c: {A: '結婚しよう', B: '白髪になるまでいっしょに笑い合いたい',
         C: '僕の奥さんになってください', D: 'ずっと一緒にいたい'},
     a: 'D',
    img: '/images/q3.jpg',
    },
  q4: 
    {q: '問4 なつかさんがしょうた君にきゅんとしたポイントは？',
    c: {A: '研修中のグループワークで、ロジカルな発言をしたとき',
    B: '買い物にいったときに赤いスポーツカーでお迎えにきたとき',
    C: '入社式当日に一目惚れ',
    D: 'しょうた君の筋肉'},
    a: 'B',
    img: '/images/q4.jpg',
    },
  q5: 
    {q: '問5 このクイズシステムの開発にかかった期間はどれくらいでしょう？',
    c: {
      A: '一週間',
    B: '一ヶ月',
    C: '三ヶ月',
    D: '一年'
    },
    a: 'A',
    img: '/images/q5.jpg'},
    
  q6: 
    {q: '問6 しょうた君の誕生日になつかさんがしたサプライズとは？',
    c: {
      A: '黒いスポーツカーをプレゼント',
      B: 'しょうた君が泊まっているホテルへ電報',
      C: 'ラーメン一年分プレゼント',
      D: 'ホテルのバー貸し切り'},
    a: 'B',
    img: '/images/q6.jpg'},
  q7: 
    {q: '問7 しょうた君がなつかさんにプロポーズをしたときに、図らずも証人となった動物とは？',
     c: {A: '猫', B: 'セントバーナード', C: '野うさぎ', D: '白鳥'},
    a: 'A',
    img: '/images/q7.jpg'},
  q8: 
    {q: '問8 告白したのはどこでしょう？',
     c: {
       A: 'ディズニーランド',
       B: 'なっちゃんのお家',
       C: 'しょうたくんのお家',
       D: 'IBM同期の水谷さんのお家'
     },
     a: 'B',
    img: '/images/q8.jpg',
    ratio: 2.0},
  };


  
// router.param('cid', /^[0-9A-Z]+$/);
var users = {};
function load_client_id() {
  var raw_data;
  var data_path = 'data/id_list.txt';
  var testdata_path = 'data/id_list_test.txt';
  if (fs.existsSync(data_path)) {
    raw_data = fs.readFileSync(data_path);
  } else {
    console.log('NOTE: loading test data: ' + testdata_path);
    raw_data = fs.readFileSync(testdata_path);
  }
  var id_list = raw_data.toString().split(/\n/);
  id_list.forEach(function(cid) { if (cid.length > 0) {users[cid] = {score: 0}; }});
  reset_data();
  reset_score();  
}

function dump_userdata() {
  fs.writeFile('data/user.msg', msgpack.pack(users), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved!");
    }
  });
}
function load_userdata() {
  try {
    var data = fs.readFileSync('data/user.msg');    
    users = msgpack.unpack(data);
    console.log(users);
    return true;
  } catch(e) {
    console.log(e);
    return false;
  }
}

if (load_userdata() === false) {
  load_client_id();
}

function reset_data() {
  answer_buf = {};
}
function reset_score() {
  for (var cid in users) {
    users[cid].score = 0.0;
  }
}



/* GET console */
router.get('/', function(req, res) {
  res.render('index', {q: questions});
});

// 問題表示 & 回答
router.get('/c/:cid([0-9A-Z]+)', function(req, res) {
  var cid = req.params.cid;
  console.log(users[cid]);
  if (users[cid] !== undefined) {
    if (users[cid].name === undefined || req.param('r') !== undefined) {
      // name registration form
      res.render('register', {user: users[cid], cid: cid});
    } else {
      var answer = req.param('a');
      var msg;
      if (answer !== undefined) {
        if (current_q !== undefined && current_q.c[answer] !== undefined &&
            start_ts !== undefined) {
          var ts = new Date().getTime();
          answer_buf[cid] = {answer: answer, ts: ts - start_ts};
          socketio.sockets.emit('update', answer_buf);
          msg = answer + 'で回答を受け付けました';
        } else {
          answer = undefined;
          msg = '今は回答できません';
        }
      }
      res.render('client', {user: users[cid], answer: answer,
                            cid: cid, q: current_q, msg: msg});
    }
  } else {
    res.render('error', {message: '不正なURLです。URLを確認してください'});
  }  
});

// 名前設定
router.post('/c/:cid([0-9A-Z]+)', function(req, res) {
  var cid = req.params.cid;
  if (users[cid] !== undefined) {
    var name = req.param('name');
    console.log(name);
    users[cid].name = name.slice(0, 16);
    dump_userdata();
    res.render('client', {user: users[cid], answer: undefined,
                          cid: cid, q: current_q, msg: undefined});
  } else {
    res.render('error', {message: '不正なURLです。URLを確認してください'});
  }  
  console.log(req.params);
});

router.get('/admin', function(req, res) {
  res.render('admin', {q: questions});
});

module.exports = router;
