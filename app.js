var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var sc_folder = path.join(__dirname, '/movies_sc');
const PORT = process.env.PORT || 5000;

var playlists = {
  "movies": [
    {
      "title": "Titanic",
      "easy": "titanic_e.png",
      "med": "titanic_m.png",
      "hard": "titanic_h.png"
    },
    {
      "title": "The Shining",
      "easy": "ts_e.png",
      "med": "ts_m.png",
      "hard": "ts_h.png"
    },
    {
      "title": "Inception",
      "easy": "inception_e.jpg",
      "med": "inception_h.jpeg",
      "hard": "inception_m.jpg"
    },
    {
      "title": "The Matrix",
      "easy": "tm_e.png",
      "med": "tm_m.png",
      "hard": "tm_h.png"
    },
    {
      "title": "Pulp Fiction",
      "easy": "pf_e.png",
      "med": "pf_m.png",
      "hard": "pf_h.png"
    }

  ]
};

let user = [];
let answers = [1,2,3,4];
let options = [1,2,3,4];
let points = 0;
let currentlevel = 0;
var difficulty;
let username;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/result', function(req, res) {
  res.sendFile(__dirname + '/result/index.html');
});

app.get('/public/main.css', function(req, res) {
  res.sendFile(__dirname + '/public/main.css');
});

app.get('/public/main.js', function(req, res) {
  res.sendFile(__dirname + '/public/main.js');
});

app.use('/movies_sc', express.static(sc_folder));

http.listen(PORT, function() {
  console.log('listening on'+ PORT);
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('user', function(data) {
    username = data;
    console.log('name: ' + data);
    answers = shuffle(answers);
    console.log(answers);
    io.emit('loadplaylist', playlists);
  });

  socket.on('select', function(data) {
    io.emit('select', data);
    console.log(data);
    user.push(data);
  });
  socket.on('difficulty', function(data) {
    difficulty=data;
    console.log(difficulty);

  });

  socket.on('load', function(data) {
    io.emit('level', currentlevel+1);
    io.emit('updatepoints', points);

    var choices = shuffle(options);



    io.emit('choices',choices);
    io.emit('c1',playlists['movies'][choices[0]]['title']);
    io.emit('c2',playlists['movies'][choices[1]]['title']);
    io.emit('c3',playlists['movies'][choices[2]]['title']);
    io.emit('c4',playlists['movies'][choices[3]]['title']);
    console.log(difficulty);

    io.emit('load',playlists['movies'][answers[data-1]][difficulty]);
  });

  socket.on('level', function(level) {
    currentlevel = level;
    console.log("This is level " + level);

      if (user[level-1] == answers[level-1]) {
        points = points + 10;
        io.emit('correct', 10);

        console.log("Correct!");
        console.log("You guesses option " + user[level-1]);
        console.log("Answer is " + answers[level-1]);
        console.log("You have " + points + " points");
      }
      else {
        io.emit('incorrect', 0);

      console.log("Incorrect!");
    }

  });

  io.emit('printname', username);
  io.emit('points', points);



  socket.on('disconnect', function(socket) {
    console.log('a user disconnected');
  });

  socket.on('resetpoint', function(data) {
    points = data;
    user = [];
    currentlevel = 0;
  });

});
