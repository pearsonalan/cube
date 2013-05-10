const YELLOW = 'Y';
const BLUE = 'B';
const GREEN = 'G';
const RED = 'R';
const ORANGE = 'O';
const WHITE = 'W';

const UP = 'U';
const DOWN = 'D';
const LEFT = 'L';
const RIGHT = 'R';
const FRONT = 'F';
const BACK = 'B';

var Cube = (function() {
  var cube;

  function initCube() {
    function makeFace(color) {
      var n,m;
      var face = new Array(3);
      for (n = 0; n < 3; n++) {
        face[n] = new Array(3);
        for (m = 0; m < 3; m++) {
          face[n][m] = color + n + m;
        }
      }
      return face;
    }

    return [
      makeFace(YELLOW),
      makeFace(WHITE),
      makeFace(BLUE),
      makeFace(GREEN),
      makeFace(RED),
      makeFace(ORANGE)
    ];
  }

  var orientationMap = {
    U: 0,
    D: 1,
    L: 2,
    R: 3,
    F: 4,
    B: 5
  };

  var faceNames = {
    U: 'UP',
    D: 'DOWN',
    L: 'LEFT',
    R: 'RIGHT',
    F: 'FRONT',
    B: 'BACK'
  };

  var faces = Object.keys(faceNames);

  function orientationToIndex(orientation) {
    return orientationMap[orientation];
  }

  function printFace(face) {
    document.write("<div class='face'>\n");
    var n,m;
    for (n = 0; n < 3; n++) {
      document.write("<div class='row'>")
      for (m = 0; m < 3; m++) {
        document.write("<div class='sticker " + face[n][m][0] + "'>" + face[n][m] + "</div>");
      }
      document.write("</div>\n");
    }
    document.write("</div>\n");
  }

  cube = initCube();

  // this describes a clockwise rotation of a face
  //       
  // 0,0   0,1   0,2          2,0   1,0   0,0    
  // 1,0   1,1   1,2    ->    2,1   1,1   0,1            
  // 2,0   2,1   2,2          2,2   1,2   0,2    
  //

  var adjacentSides = {
    U: "LBRF",
    D: "FRBL",
    L: "UFDB",
    R: "BDFU",
    F: "URDL",
    B: "LDRU"
  };

  var adjacentSelector = {
    U: function(n) { return [0,n]; },
    D: function(n) { return [2,n]; },
    L: function(n) { return [n,0]; },
    R: function(n) { return [n,2]; },
    F: function(n) { return [0,n]; },
    B: function(n) { return [2,n]; }
  };

  function debug(str) {
    document.write("<div class='debug'>" + str + "</div>\r\n");
  }
  
  function rotate(orientation, direction) {

    function cw(n,m) {
      return [2-m,n];
    }

    function ccw(n,m) {
      return [m,2-n];
    }

    function rotateFace(orig,transform) {
      var n,m;
      var face = new Array(3);
      for (n = 0; n < 3; n++) {
        face[n] = new Array(3);
      }

      for (n = 0; n < 3; n++) {
        for (m = 0; m < 3; m++) {
          var indices = transform(n,m);
          debug("moving " + n + "," + m + " to " + indices[0] + "," + indices[1]);
          // face[indices[0]][indices[1]] = orig[n][m];
          face[n][m] = orig[indices[0]][indices[1]];
        }
      }
      return face;
    }

    function rotateFaceSides() {
      var sides = adjacentSides[orientation];
      debug("rotating face sides. side string = " + sides);

      var s, i;
      var fn = adjacentSelector[orientation];

      var newsides = [];

      for (s = 0; s < 4; s++) {
        var side = getFace(sides[s]);
        var n,m;
        var face = new Array(3);
        for (n = 0; n < 3; n++) {
          face[n] = new Array(3);
          for (m = 0; m < 3; m++) {
            face[n][m] = side[n][m];
          }
        }
        newsides[s] = face;
      }

      for (s = 0; s < 4; s++) {
        var fromSide = getFace(sides[(s+1)%4]),
            toSide = newsides[s];
        for (i = 0; i < 3; i++) {
          var indices = fn(i);
          toSide[indices[0]][indices[1]] = fromSide[indices[0]][indices[1]];
        }
      }

      for (s = 0; s < 4; s++) {
        //debug("copying new side for " + sides[s] + " from index " + s + " to " + orientationToIndex(sides[s]));
        cube[orientationToIndex(sides[s])] = newsides[s];
      }

    }

    var face = cube[orientationToIndex(orientation)];

    if (direction == "") {
      face = rotateFace(face,cw);
      cube[orientationToIndex(orientation)] = face;
      rotateFaceSides();
    }

    if (direction == "'") {
      face = rotateFace(face,ccw);
      cube[orientationToIndex(orientation)] = face;
      rotateFaceSides();
    }
  }

  function move(cmd) {
    var orientation = cmd[0],
        direction = cmd[1] || '';
    return rotate(orientation,direction);
  }

  function getFace(orientation) {
    return cube[orientationToIndex(orientation)];
  }

  return {
    getFace: getFace,
    printCube: function() {
      faces.forEach(function (face) {
        document.write('<h4>' + faceNames[face] + '</h4>\n');
        printFace(cube[orientationToIndex(face)]);
      });
    },
    rotate: rotate,
    move: move
  };
}());


document.write("<h1>Initial State</h1>\r\n");
Cube.printCube();

document.write("<h1>Performing move: L'</h1>\r\n");
Cube.move("L'");
Cube.printCube();

document.write("<h1>Performing move: U</h1>\r\n");
Cube.move("U");
Cube.printCube();

document.write("<h1>Performing move: F</h1>\r\n");
Cube.move("F");
Cube.printCube();

document.write("<h1>Performing move: U</h1>\r\n");
Cube.move("U");
Cube.printCube();

