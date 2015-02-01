var express = require('express');
var router = express.Router();

var socketio;
var answer_buf;
var current_q;
var start_ts;

function reset_data() {
  answer_buf = {};
}
reset_data();

function event_handler(msg) {
  console.log(msg);
  switch(msg.name) {
  case 'end':
    socketio.sockets.emit('result', {result: answer_buf, correct: current_q.a});
    for (k in answer_buf) {
      // TODO: calc points for players
    }
    start_ts = undefined;
    reset_data(); 
    return false;

  case 'setq':
    current_q = questions[msg.data];
    socketio.sockets.emit('event', {name: 'setq', data: questions[msg.data]});
    return false;


  case 'start':
    start_ts = new Date().getTime();
    break;
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
  q1: {q: 'このシステムの開発期間はどれくらいでしょう？',
       c: {A: '12時間', B: '24時間', C: '48時間', D: '96時間'},
       a: 'B'},
  q2: {q: '初デートはどこでしょう？',
       c: {A: '東京タワー', B: 'みなとみらい', C: 'ディズニー', D: 'お台場'},
       a: 'C'},
};

  
/* GET client */
// router.param('cid', /^[0-9A-Z]+$/);
var users = {
  user1: {
    name: 'Yutaka',
  },
  user2: {
    name: 'Yoshiki',
  },
  user3: {
    name: 'Kaoruko',
  },
  user4: {
    name: 'Masa',
  }
};


/* GET console */
router.get('/', function(req, res) {
  res.render('index', {q: questions});
});

router.get('/c/:cid([0-9A-Z]+)', function(req, res) {
  var cid = req.params.cid;
  if (users[cid] !== undefined) {
    var answer = req.param('a');
    if (current_q !== undefined && current_q.c[answer] !== undefined &&
        start_ts !== undefined) {
      var ts = new Date().getTime();
      answer_buf[cid] = {answer: answer, ts: ts - start_ts};
      socketio.sockets.emit('update', answer_buf);
    }
      
    res.render('client', {user: users[cid], answer: answer,
                          q: current_q});
  } else {
    res.render('error', {messages: 'Invalid user ID'});
  }

  
});

router.get('/admin', function(req, res) {
  res.render('admin', {q: questions});
});

module.exports = router;
