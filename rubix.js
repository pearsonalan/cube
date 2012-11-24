function extend(o,h) {
  Object.keys(h).forEach(function(i) {
    o[i] = h[i];
  });
}

function bind(f,that) {
  return function() {
    return f.apply(that,arguments);
  }
}

extend( Function.prototype, {
  curry: function () {
    var args = Array.prototype.slice.apply(arguments),
      that = this;
    return function () {
      return that.apply(null,args.concat(Array.prototype.slice.apply(arguments)));
    }
  }
});

function $ID(x) {
  return document.getElementById(x);
}

function $CLASS(x) {
  return document.getElementsByClass(x);
}

function removeChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function constructor(proto) {
  var o = Object.create(proto);
  return o.init.apply(o,Array.prototype.slice.call(arguments,1));
}


var Builder = (function () {
  function isStringOrNumber(param) {
    return (typeof param=='string' || typeof param=='number');
  }

  function makeElement(ns,name) {
    var element = ns !== undefined ? document.createElementNS(ns,name) : document.createElement(name);

    if (arguments[2]) {
      if (isStringOrNumber(arguments[2]) || (arguments[2] instanceof Array)) {
        element.appendChild(document.createTextNode(arguments[2]));
      } else {
        for (attr in arguments[2]) {
          element.setAttribute(attr == 'className' ? 'class' : attr, arguments[2][attr]);
        }
      }
    }

    if (arguments[3]) {
      if (arguments[3] instanceof Array) {
        arguments[3].forEach(function (a) {
          element.appendChild(a);
        });
      } else {
        if (isStringOrNumber(arguments[3])) { 
          element.appendChild(document.createTextNode(arguments[3]));
        }
      }
    }

    return element;
  }

  function initialize() {
    var elements = "div p a img h1 h2 h3 h4 h5 h6 iframe img input span".split(" ");
    var svgelements = "svg g line rect".split(" ");
    var m = {};
    elements.forEach(function(item) {
      m[item.toUpperCase()] = makeElement.curry(undefined,item);
    });
    svgelements.forEach(function(item) {
      m[item.toUpperCase()] = makeElement.curry("http://www.w3.org/2000/svg",item);
    });
    return m;
  }

  return initialize();
})();


function output(c,str) {
  var div = Builder.DIV({className:c},str),
      outputDiv = $ID('output');
  outputDiv.appendChild(div);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function debug(str) {
  output('debug',str);
}

var Cube = (function() {
  var cube;

  var Face = (function() {

    function cw(x,y) {
      return [2-y,x];
    }

    function ccw(x,y) {
      return [y,2-x];
    }

    function index(x,y) {
      return x*3+y;
    }

    var proto = {
      init: function(arg) {
        var x, y;
        var i;

        this.colors = new Array(9);
        this.labels = new Array(9);

        if (typeof arg === "string") {
          for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
              this.colors[index(x,y)] = arg;
              this.labels[index(x,y)] = arg + index(x,y) ;
            }
          }
        } else {
          for (i = 0; i < 9; i++) {
            this.colors[i] = arg.colors[i];
            this.labels[i] = arg.labels[i];
          }
        }
        return this;
      },

      dump: function() {
        var x,y;
        var rows = [];
        for (y = 0; y < 3; y++) {
          var stickers = [];
          for (x = 0; x < 3; x++) {
            stickers.push(Builder.DIV({class:"sticker " + this.colorAt(x,y)}, this.labelAt(x,y)));
          }
          rows.push(Builder.DIV({class:"row"},stickers));
        }
        return Builder.DIV({class:"face"},rows);
      },

      rotate: function(direction) {
        var transform = (direction === "cw" ? cw : ccw);
        var n, x, y,
            ncolors = new Array(9),
            nlabels = new Array(9);

        for (y = 0; y < 3; y++) {
          for (x = 0; x < 3; x++) {
            var indices = transform(x,y),
                nx = indices[0],
                ny = indices[1];
            ncolors[nx*3+ny] = this.colors[index(x,y)];
            nlabels[nx*3+ny] = this.labels[index(x,y)];
          }
        }

        this.colors = ncolors;
        this.labels = nlabels;
      },

      colorAt: function(x,y) {
        return this.colors[index(x,y)];
      },

      labelAt: function(x,y) {
        return this.labels[index(x,y)];
      }

    };

    return constructor.curry(proto);
  }());

  function initCube() {
    return {
      U: Face("Y"),
      D: Face("W"),
      L: Face("B"),
      R: Face("G"),
      F: Face("R"),
      B: Face("O")
    };
  }

  var faceNames = {
    U: 'UP',
    D: 'DOWN',
    L: 'LEFT',
    R: 'RIGHT',
    F: 'FRONT',
    B: 'BACK'
  };

  var faces = Object.keys(faceNames);

  cube = initCube();

  var adjacentSides = {
    U: "LBRF",
    D: "FRBL",
    L: "UFDB",
    R: "BDFU",
    F: "URDL",
    B: "LDRU"
  };

 
  // face cell indexes:
  //   0  3  6
  //   1  4  7
  //   2  5  8
  //

  var adjacentIndices = {
    U: {
      F: [0,3,6],
      R: [0,3,6],
      B: [8,5,2],
      L: [8,5,2]
    },
    D: { 
      F: [8,5,2],
      R: [8,5,2],
      B: [0,3,6],
      L: [0,3,6]
    },
    L: {
      F: [2,1,0],
      U: [2,1,0],
      B: [2,1,0],
      D: [2,1,0]
    }, 
    R: {
      F: [6,7,8],
      U: [6,7,8],
      B: [6,7,8],
      D: [6,7,8]
    },
    F: {
      U: [2,5,8],
      R: [0,1,2],
      D: [6,3,0],
      L: [0,1,2]
    },
    B: {
      U: [0,3,6],
      R: [6,7,8],
      D: [8,5,2],
      L: [6,7,8]
    }
  };

  function rotate(orientation, direction) {

    function rotateFaceSides() {
      var sides = adjacentSides[orientation];
      if (direction === "'") {
        sides = sides[3] + sides[2] + sides[1] + sides[0];
      }
      debug("rotating face sides. side string = " + sides);

      var s,
          newFaces = [];

      for (s = 0; s < 4; s++) {
        newFaces[s] = Face(getFace(sides[s]));
      }

      for (s = 0; s < 4; s++) {
        var fromFace = getFace(sides[(s+4-1)%4]),
            toFace = newFaces[s];
        var fromIndices = adjacentIndices[orientation][sides[(s+4-1)%4]],
            toIndices = adjacentIndices[orientation][sides[s]];
        for (i = 0; i < 3; i++) {
          toFace.colors[toIndices[i]] = fromFace.colors[fromIndices[i]];
          toFace.labels[toIndices[i]] = fromFace.labels[fromIndices[i]];
        }
      }

      for (s = 0; s < 4; s++) {
        cube[sides[s]] = newFaces[s];
      }
    }

    var face = cube[orientation];

    if (direction == "") {
      cube[orientation].rotate("cw");
      rotateFaceSides();
    }

    if (direction == "'") {
      cube[orientation].rotate("ccw");
      rotateFaceSides();
    }
  }

  function move(cmd) {
    output("h1","Performing move: " + cmd);
    var orientation = cmd[0],
        direction = cmd[1] || '';
    return rotate(orientation,direction);
  }

  function getFace(orientation) {
    return cube[orientation];
  }

  return {
    getFace: getFace,
    colorAt: function(orientation,x,y) {
      return getFace(orientation).colorAt(x,y);
    },
    labelAt: function(orientation,x,y) {
      return getFace(orientation).labelAt(x,y);
    },
    printCube: function() {
      faces.forEach(function (face) {
        output('h4',faceNames[face]);
        var div = cube[face].dump();
        $ID('output').appendChild(div);
      });
    },
    rotate: rotate,
    move: move
  };
}());


var Validator = (function() {
  var corners = [
    "U00 L22 B02",
    "U20 B22 R20",
    "U02 F00 L02",
    "U22 R00 F20",
    "D00 L00 F02",
    "D20 F22 R02",
    "D02 B00 L20",
    "D22 R22 B20"
  ];

  var validCornerColors = {
    "Y0 B8 O2": true,
    "B8 O2 Y0": true,
    "O2 Y0 B8": true,
    "Y6 O8 G6": true,
    "O8 G6 Y6": true,
    "G6 Y6 O8": true,
    "Y2 R0 B2": true,
    "R0 B2 Y2": true,
    "B2 Y2 R0": true,
    "Y8 G0 R6": true,
    "G0 R6 Y8": true,
    "R6 Y8 G0": true,
    "W0 B0 R2": true,
    "B0 R2 W0": true,
    "R2 W0 B0": true,
    "W6 R8 G2": true,
    "R8 G2 W6": true,
    "G2 W6 R8": true,
    "W2 O0 B6": true,
    "O0 B6 W2": true,
    "B6 W2 O0": true,
    "W8 G8 O6": true,
    "G8 O6 W8": true,
    "O6 W8 G8": true
  };

  var sides = [
    "F01 L01",
    "F10 U12",
    "F21 R01",
    "F12 D10",
    "B01 L21",
    "B10 D12",
    "B21 R21",
    "B12 U10",
    "L10 D01",
    "D21 R12",
    "R10 U21",
    "U01 L12"
  ];

  var validSideColors = {
    "R1 B1": true,
    "B1 R1": true,
    "R3 Y5": true,
    "Y5 R3": true,
    "R7 G1": true,
    "G1 R7": true,
    "R5 W3": true,
    "W3 R5": true,
    "O1 B7": true,
    "B7 O1": true,
    "O3 W5": true,
    "W5 O3": true,
    "O7 G7": true,
    "G7 O7": true,
    "O5 Y3": true,
    "Y3 O5": true,
    "B3 W1": true,
    "W1 B3": true,
    "W7 G5": true,
    "G5 W7": true,
    "G3 Y7": true,
    "Y7 G3": true,
    "Y1 B5": true,
    "B5 Y1": true,
  };

  function getSubCubeLabels(cube,subcube) {
    var subCubeFaces = subcube.split(' ');
    var labels = subCubeFaces.map(function (cell) {
      return cube.labelAt(cell[0],parseInt(cell[1]),parseInt(cell[2]));
    });
    return labels.join(' ');
  }

  function validateSubCube(cube,validValues,subcube) {
    console.log("Validating subcube at %s", subcube);
    var labels = getSubCubeLabels(cube,subcube);
    console.log("  labels at %s = %s", subcube, labels);
    if (validValues[labels] === true) {
      console.log("    valid");
      return true;
    } else {
      console.log("    INVALID!");
      alert("Discovered invalid piece: colors " + labels + " at " + subcube);
      return false;
    }
  }

  function validateModel(cube) {
    var allCornersValid = corners.every(validateSubCube.curry(cube,validCornerColors));
    var allSidesValid = sides.every(validateSubCube.curry(cube,validSideColors));
    return allCornersValid && allSidesValid;
  }

  return {
    validate: validateModel
  };
}());


function makeCubeView(cube) {
  var B = Builder;

  function makeSticker(color, label, modelLabel) {
    if (color === undefined) {
      return undefined;
    }

    return B.DIV({class: "sticker " + color}, [
      B.DIV({class: "color-label"}, color),
      B.DIV({class: "position-label"}, label),
      B.DIV({class: "model-label"}, modelLabel)
    ]);
  }

  function makeFace(color, directionStyle, label, modelLabel) {
    var sticker = undefined;
    if (color !== undefined) {
      sticker = [ makeSticker(color, label, modelLabel) ];
    }
    return B.DIV({class: "face " + directionStyle},sticker);
  }

  function makeSubCube(colors, x, y, z, labels, modelLabels) {
    var u = makeFace(colors[0],'up-face', labels[0], modelLabels[0]),
        d = makeFace(colors[1],'down-face', labels[1], modelLabels[1]),
        r = makeFace(colors[2],'right-face', labels[2], modelLabels[2]),
        l = makeFace(colors[3],'left-face', labels[3], modelLabels[3]),
        b = makeFace(colors[4],'back-face', labels[4], modelLabels[4]),
        f = makeFace(colors[5],'front-face', labels[5], modelLabels[5]);
    var c =  B.DIV({class: "subcube"}, [u,d,r,l,b,f]);
    c.style.webkitTransform = 
      "translateX(" + x + "px)" +
      "translateY(" + y + "px)" +
      "translateZ(" + z + "px)";
    return c;
  }

  var colors = {
    'Y' : 'yellow',
    'R' : 'red',
    'O' : 'orange',
    'B' : 'blue',
    'G' : 'green',
    'W' : 'white'
  };

  function modelColor(faceName,x,y) {
    var face = cube.getFace(faceName);
    return colors[face.colorAt(x,y)];
  }

  function modelLabel(faceName,x,y) {
    var face = cube.getFace(faceName);
    return face.labelAt(x,y);
  }

  function makeSubCubeFromPosition(x,y,z) {
    function makeLabel(dir,x,y) {
      return [dir,"(",x,",",y,")"].join(''); 
    }
    var colors = [
      (y === 0 ? modelColor('U',x,z) : undefined),
      (y === 2 ? modelColor('D',x,2-z) : undefined),
      (x === 2 ? modelColor('R',2-z,y) : undefined),
      (x === 0 ? modelColor('L',2-z,2-y) : undefined),
      (z === 0 ? modelColor('B',x,2-y) : undefined),
      (z === 2 ? modelColor('F',x,y) : undefined)
    ];
    var labels = [
      (y === 0 ? makeLabel('Up',x,z) : undefined),
      (y === 2 ? makeLabel('Down',x,(2-z)) : undefined),
      (x === 2 ? makeLabel('Right',(2-z),y) : undefined),
      (x === 0 ? makeLabel('Left',(2-z),(2-y)) : undefined),
      (z === 0 ? makeLabel('Back',x,(2-y)) : undefined),
      (z === 2 ? makeLabel('Front',x,y) : undefined)
    ];
    var modelLabels = [
      (y === 0 ? modelLabel('U',x,z) : undefined),
      (y === 2 ? modelLabel('D',x,2-z) : undefined),
      (x === 2 ? modelLabel('R',(2-z),y) : undefined),
      (x === 0 ? modelLabel('L',2-z,2-y) : undefined),
      (z === 0 ? modelLabel('B',x,2-y) : undefined),
      (z === 2 ? modelLabel('F',x,y) : undefined)
    ];
    return makeSubCube(colors,x*100-150,y*100-150,z*100-150,labels,modelLabels);
  }

  function makeLayer(n) {
    // return B.DIV({class: "layer"},[
    //   makeSubCubeFromPosition(0,0,n), makeSubCubeFromPosition(1,0,n), makeSubCubeFromPosition(2,0,n),
    //   makeSubCubeFromPosition(0,1,n), makeSubCubeFromPosition(1,1,n), makeSubCubeFromPosition(2,1,n),
    //   makeSubCubeFromPosition(0,2,n), makeSubCubeFromPosition(1,2,n), makeSubCubeFromPosition(2,2,n)
    // ]);

    return B.DIV({class: "layer"},[
      makeSubCubeFromPosition(n,0,0), makeSubCubeFromPosition(n,0,1), makeSubCubeFromPosition(n,0,2),
      makeSubCubeFromPosition(n,1,0), makeSubCubeFromPosition(n,1,1), makeSubCubeFromPosition(n,1,2),
      makeSubCubeFromPosition(n,2,0), makeSubCubeFromPosition(n,2,1), makeSubCubeFromPosition(n,2,2)
    ]);
  }

  var layers = [
    makeLayer(0),
    makeLayer(1),
    makeLayer(2)
  ];
 
  var div = B.DIV({class: "cube"}, layers);

  // var n = 0;
  // window.setInterval(function() {
  //   layers[2].style.webkitTransform = "rotateX(" + (n*5) + "deg)";
  //   n = n + 1;
  // },100);

  var rot = 0;

  // window.setTimeout(function() {
  //   layers[2].style.webkitTransform = "rotateX(90deg)";
  // },1000);

  document.body.addEventListener('keypress', function (evt) {
    var key = evt.keyCode || evt.which;
    var keychar = String.fromCharCode(key);
  
    if (keychar == 'g') {
      rot = rot + 90;
      layers[2].style.webkitTransform = "rotateX(" + rot + "deg)";
    }

    if (keychar == 'G') {
      rot = rot - 90;
      layers[2].style.webkitTransform = "rotateX(" + rot + "deg)";
    }

  },false);

  return div;
}

function makeScene() {
  var cubeView = makeCubeView(Cube);
  var rotator = Builder.DIV({class: "rotator"},[cubeView]);
  var camera = Builder.DIV({class: "camera"},[rotator]);
  var scene = Builder.DIV({class: "scene"},[camera]);
  var container = Builder.DIV({class: "container"},[scene]);

  // var n = 0;
  // window.setInterval(function() {
  //   cubeView.style.webkitTransform = "rotateX(" + (n*5) + "deg) rotateY(40deg)";
  //   n = n + 1;
  // },100);

  document.body.appendChild(container);

  document.body.addEventListener('mousemove', function (evt) {
    // console.log("mousemove: ", evt);
    rotator.style.webkitTransform = "rotateY(" + (evt.x/2) + "deg) rotateX(" + (-evt.y/2) + "deg)";
  },false);

  var moves = {
    'u' : "U",
    'U' : "U'",
    'd' : "D",
    'D' : "D'",
    'b' : "B",
    'B' : "B'",
    'f' : "F",
    'F' : "F'",
    'r' : "R",
    'R' : "R'",
    'l' : "L",
    'L' : "L'",
  };

  document.body.addEventListener('keypress', function (evt) {
    var key = evt.keyCode || evt.which,
        keychar = String.fromCharCode(key),
        move = moves[keychar];
    if (move !== undefined) {
      console.log("Performing move: " + move);
      Cube.move(move);
      Cube.printCube();
      Validator.validate(Cube);
      removeChildren(rotator);
      cubeView = makeCubeView(Cube);
      rotator.appendChild(cubeView);
    }
  },false);


  return [container, camera, scene, cubeView];
}

window.addEventListener("DOMContentLoaded", function() {
  Validator.validate(Cube);
  var elements = makeScene();
  window.setTimeout(function () {
    elements[0].style.opacity = "1";
    elements[1].style.webkitTransform = "translateX(400px) translateY(400px) translateZ(-400px)";
  },0);
}, false);
