var express = require('express');
var msgpack = require('msgpack');
var fs = require('fs');

var router = express.Router();

var socketio;
var answer_buf;
var current_q;
var start_ts;
var score_board;
var basic_score = 50;
var bonus_score = 50;

function reset_data() {
  answer_buf = {};
}
function reset_score() {
  score_board = {};
}
reset_data();
reset_score();

function event_handler(msg) {
  console.log(msg);
  switch(msg.name) {
  case 'result':
    socketio.sockets.emit('result', {result: answer_buf, users: users,
                                     correct: current_q.a});
    return false;
    
  case 'end':
    for (k in answer_buf) {
      // TODO: calc points for players
    }
    start_ts = undefined;
    return false;

  case 'setq':
    reset_data(); 
    current_q = questions[msg.data];
    current_q.qid = msg.data;
    socketio.sockets.emit('event', {name: 'setq', data: questions[msg.data]});
    return false;


  case 'start':
    start_ts = new Date().getTime();
    break;

  case 'reset':
    reset_score();
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
      q: '去年のバレンタインになつかさんがしょうた君にあげたものは！？',
    c: {A: 'ラーメン', B: '自転車', C: '温泉旅行' , D: '香水'},
    a: 'D',
    img: 'http://fakeout-magazine.com/wp-content/uploads/2015/02/%E3%83%90%E3%83%AC%E3%83%B3%E3%82%BF%E3%82%A4%E3%83%B3%E3%83%87%E3%83%BC%E3%80%81%E3%83%86%E3%83%87%E3%82%A3%E3%83%99%E3%82%A2.jpg',
    },

    q2: {q: 'これまでに二人で走ってきた総走行距離は何キロか？',
    c: {A: '42km', B: '250km', C: '1430km', D: '3300km'},
    a: 'C',
    img: 'http://funnydate.up.seesaa.net/image/00088282_090331072422.jpg',
    },
  q3: 
    {q: 'しょうた君のプロポーズの言葉は？',
     c: {A: '結婚しよう', B: '白髪になるまでいっしょに笑い合いたい',
         C: '僕の奥さんになってください', D: 'ずっと一緒にいたい'},
     a: 'D',
     img: 'http://funnydate.up.seesaa.net/image/00088282_090331072422.jpg'
    },
  q4: 
    {q: 'なつかさんがしょうた君にきゅんとしたポイントは？',
    c: {A: '研修中のグループワークで、ロジカルな発言をしたとき',
    B: '買い物にいったときに赤いスポーツカーでお迎えにきたとき',
    C: '入社式当日に一目惚れ',
    D: '磯村君の筋肉'},
    a: 'B',
    img: ''},
  q5: 
    {q: 'キノコ嫌いのしょうた君が大丈夫だったキノコ科の食べ物はなんでしょう？',
    c: {A: '松茸', B: ' エリンギ', C: 'マイタケ', D: 'キクラゲ'},
    a: 'D',
    img: 'http://www.showanavi.jp/archive/archive/images/7176.jpg'},
  q6: 
    {q: 'しょうた君がなつかさんにプロポーズをしたときに、図らずも証人となった動物とは？',
    c: {A: '猫', B: 'セントバーナード', C: '野うさぎ', D: '白鳥'},
    a: 'A',
    img: 'http://ubuntu.firebird.jp/wp-content/uploads/2012/04/koshachya-molitva.jpg'},
  q7: 
    {q: '告白したのはどこでしょう？',
    c: {
      A: 'ディズニーランド',
    B: 'なっちゃんのお家',
    C: 'しょうたくんのお家',
    D: 'IBM同期の水谷さんのお家'
    },
    a: 'B',
    img: 'http://invisible-one.tokyo/wp/wp-content/uploads/2014/11/blog-love.jpg'},
  q8: 
    {q: 'このシステムの開発にかかった期間はどれくらいでしょう？',
    c: {
      A: '一週間',
    B: '一ヶ月',
    C: '三ヶ月',
    D: '一年'
    },
    a: 'A',
    img: 'http://livedoor.blogimg.jp/nnt_boy/imgs/a/3/a32ffca5.png'},
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
  id_list.forEach(function(cid) { if (cid.length > 0) {users[cid] = {}; }});
}
load_client_id();


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
    res.render('error', {messages: '不正なURLです。URLを確認してください'});
  }  
});

// 名前設定
router.post('/c/:cid([0-9A-Z]+)', function(req, res) {
  var cid = req.params.cid;
  if (users[cid] !== undefined) {
    var name = req.param('name');
    console.log(name);
    users[cid].name = name.slice(0, 16);
    res.render('client', {user: users[cid], answer: undefined,
                          cid: cid, q: current_q});
  } else {
    res.render('error', {messages: '不正なURLです。URLを確認してください'});
  }  
  console.log(req.params);
});

router.get('/admin', function(req, res) {
  res.render('admin', {q: questions});
});

module.exports = router;
