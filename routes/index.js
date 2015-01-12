var express = require('express');
var router = express.Router();

/* GET console */
router.get('/', function(req, res) {
  res.render('index', {});
});

var socketio;
var answer_buf;

function reset_data() {
  answer_buf = {};
}
reset_data();

function event_handler(msg) {
  if (msg.name == 'end') {
    socketio.sockets.emit('result', answer_buf);
    reset_data();
    return false;
  }

  return true;
}

router.set_socket = function(s) {
  socketio = s;
  socketio.on('connection', function (socket) {
    // socket.emit('cmd', { hello: 'world' });
    socket.on('event', function (msg) {
      console.log(msg);      
      if (event_handler(msg)) {
        socketio.sockets.emit('event', msg);
      }
    });
  });

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

router.get('/c/:cid([0-9A-Z]+)', function(req, res) {
  console.log(req.body);
  console.log(req.params);
  var cid = req.params.cid;
  if (users[cid] !== undefined) {
    res.render('client', {user: users[cid], answer: null});
  } else {
    res.render('error', {messages: 'Invalid user ID'});
  }
});
router.post('/c/:cid([0-9A-Z]+)', function(req, res) {
  var cid = req.params.cid;
  var answer = req.body.answer;

  if (users[cid] !== undefined) {
    if (answer === 'Yes' || answer === 'No') {
      answer_buf[cid] = answer;
      console.log(answer_buf);
      res.render('client', {user: users[cid], 
                            answer: answer});
    } else {
      res.render('error', {messages: 'Invalid answer'});
    }
  } else {
    res.render('error', {messages: 'Invalid user ID'});
  }
});

router.get('/admin', function(req, res) {
  res.render('admin', {});
});

module.exports = router;
