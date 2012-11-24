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

var showLabels = true;

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


function makeCubeView(cube) {
  var B = Builder;

  function makeSticker(color, label, modelLabel) {
    if (color === undefined) {
      return undefined;
    }

    return B.DIV({class: "sticker " + color}, (showLabels ? [
      B.DIV({class: "color-label"}, color),
      B.DIV({class: "position-label"}, label),
      B.DIV({class: "model-label"}, modelLabel)
    ] : []));
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

  (function () {
    var l2rot = 0, l0rot = 0;
    document.body.addEventListener('keypress', function (evt) {
      var key = evt.keyCode || evt.which;
      var keychar = String.fromCharCode(key);

      if (keychar == 'g') {
        l0rot = l0rot - 90;
        layers[0].style.webkitTransform = "rotateX(" + l0rot + "deg)";
      }

      if (keychar == 'G') {
        l0rot = l0rot + 90;
        layers[0].style.webkitTransform = "rotateX(" + l0rot + "deg)";
      }
    
      if (keychar == 'h') {
        l2rot = l2rot + 90;
        layers[2].style.webkitTransform = "rotateX(" + l2rot + "deg)";
      }

      if (keychar == 'H') {
        l2rot = l2rot - 90;
        layers[2].style.webkitTransform = "rotateX(" + l2rot + "deg)";
      }
    },false);
  }());

  return div;
}

function makeScene() {

  var rotator = (function () {
    var xrot = 0, yrot = 0, rotating = false;

    var rotatorDiv = Builder.DIV({class: "rotator"},[]);

    document.body.addEventListener('mousedown', function (evt) {
      console.log("mousedown");
      rotating = true;
    },false);

    document.body.addEventListener('mouseup', function (evt) {
      console.log("mouseup");
      rotating = false;
    },false);

    document.body.addEventListener('mousemove', function (evt) {
      console.log("mousemove: ", evt);
      if (rotating && (evt.webkitMovementY !== 0 || evt.webkitMovementX !== 0)) {
        // mouse movement in the x-axis causes cube rotation around the y-axis and vice-versa
        xrot = xrot - evt.webkitMovementY/2;
        yrot = yrot + evt.webkitMovementX/2;
        rotatorDiv.style.webkitTransform = "rotateY(" + yrot + "deg) rotateX(" + xrot + "deg)";
      }
    },false);

    return {
      setCubeView: function (cubeView) {
        removeChildren(rotatorDiv);
        rotatorDiv.appendChild(cubeView);
      },
      getRotatorDiv: function () {
        return rotatorDiv;
      }
    };
  }());

  rotator.setCubeView(makeCubeView(Cube));

  var camera = Builder.DIV({class: "camera"},[rotator.getRotatorDiv()]);
  var scene = Builder.DIV({class: "scene"},[camera]);
  var container = Builder.DIV({class: "container"},[scene]);

  document.body.appendChild(container);


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
      rotator.setCubeView(makeCubeView(Cube));
    }
  },false);


  return [container, camera, scene];
}

window.addEventListener("DOMContentLoaded", function() {
  Validator.validate(Cube);
  var elements = makeScene();
  window.setTimeout(function () {
    elements[0].style.opacity = "1";
    elements[1].style.webkitTransform = "translateX(400px) translateY(400px) translateZ(-400px)";
  },0);
}, false);
