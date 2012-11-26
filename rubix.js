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

var showLabels = window.location.hash.indexOf("labels") != -1;

function output(c,str) {
  var div = Builder.DIV({className:c},str),
      outputDiv = $ID('output');
  outputDiv.appendChild(div);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function debug(str) {
  output('debug',str);
}

var FaceNames = {
  U: 'UP',
  D: 'DOWN',
  L: 'LEFT',
  R: 'RIGHT',
  F: 'FRONT',
  B: 'BACK'
};

var Faces = Object.keys(FaceNames);

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
      Faces.forEach(function (face) {
        output('h4',FaceNames[face]);
        var div = cube[face].dump();
        $ID('output').appendChild(div);
      });
    },
    rotate: rotate,
    move: move
  };
}());


function makeCubeView(cube,rotationAxis) {
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

  function makeLayer(n,clockwiseRotation) {
    var layerDiv, 
        rot = 0, 
        transitionEndCallback = undefined;

    if (rotationAxis === 'Z') {
      layerDiv = B.DIV({class: "layer"},[
        makeSubCubeFromPosition(0,0,n), makeSubCubeFromPosition(1,0,n), makeSubCubeFromPosition(2,0,n),
        makeSubCubeFromPosition(0,1,n), makeSubCubeFromPosition(1,1,n), makeSubCubeFromPosition(2,1,n),
        makeSubCubeFromPosition(0,2,n), makeSubCubeFromPosition(1,2,n), makeSubCubeFromPosition(2,2,n)
      ]);
    }

    if (rotationAxis === 'X') {
      layerDiv = B.DIV({class: "layer"},[
        makeSubCubeFromPosition(n,0,0), makeSubCubeFromPosition(n,0,1), makeSubCubeFromPosition(n,0,2),
        makeSubCubeFromPosition(n,1,0), makeSubCubeFromPosition(n,1,1), makeSubCubeFromPosition(n,1,2),
        makeSubCubeFromPosition(n,2,0), makeSubCubeFromPosition(n,2,1), makeSubCubeFromPosition(n,2,2)
      ]);
    }

    if (rotationAxis === 'Y') {
      layerDiv = B.DIV({class: "layer"},[
        makeSubCubeFromPosition(0,n,0), makeSubCubeFromPosition(0,n,1), makeSubCubeFromPosition(0,n,2),
        makeSubCubeFromPosition(1,n,0), makeSubCubeFromPosition(1,n,1), makeSubCubeFromPosition(1,n,2),
        makeSubCubeFromPosition(2,n,0), makeSubCubeFromPosition(2,n,1), makeSubCubeFromPosition(2,n,2)
      ]);
    }

    layerDiv.addEventListener('webkitTransitionEnd', function (evt) {
      if (transitionEndCallback !== undefined) {
        transitionEndCallback();
        transitionEndCallback = undefined;
      }
    }, false);

    function setTransform() {
      layerDiv.style.webkitTransform = "rotate" + rotationAxis + "(" + rot + "deg)";
    }

    return {
      getLayerDiv: function() {
        return layerDiv;
      },
      getRotationAxis: function() {
        return rotationAxis;
      },
      rotateClockwise: function(callback) {
        rot = rot + clockwiseRotation;
        transitionEndCallback = callback;
        setTransform();
      },
      rotateCounterClockwise: function(callback) {
        rot = rot - clockwiseRotation;
        transitionEndCallback = callback;
        setTransform();
      }
    };
  }

  var layers = [
    makeLayer(0,-90),
    makeLayer(1,  0),
    makeLayer(2, 90)
  ];
 
  document.body.addEventListener('keypress', function (evt) {
    var key = evt.keyCode || evt.which;
    var keychar = String.fromCharCode(key);

    if (keychar == 'g') {
      layers[0].rotateClockwise();
    }

    if (keychar == 'G') {
      layers[0].rotateCounterClockwise();
    }
  
    if (keychar == 'h') {
      layers[2].rotateClockwise();
    }

    if (keychar == 'H') {
      layers[2].rotateCounterClockwise();
    }
  },false);


  function rotate(layerIndex,direction,callback) {
    if (direction === "cw") {
      layers[layerIndex].rotateClockwise(callback);
    } else {
      layers[layerIndex].rotateCounterClockwise(callback);
    }
  }

  var cubeDiv = B.DIV({class: "cube"}, layers.map(function (l) { return l.getLayerDiv();}));

  return {
    getCubeDiv: function () { return cubeDiv; },
    rotate: rotate,
    rotateAfterDelay: function(layerIndex,direction,callback) {
      window.setTimeout(function () {
        rotate(layerIndex,direction,callback);
      },0);
    }
  };
}

function makeScene() {

  var rotator = (function () {
    var xrot = 0, yrot = 0, rotating = false;
    var cubeView = undefined;

    var rotatorDiv = Builder.DIV({class: "rotator"},[]);
    addFaceIndicators();

    document.body.addEventListener('mousedown', function (evt) {
      rotating = true;
    },false);

    document.body.addEventListener('mouseup', function (evt) {
      rotating = false;
    },false);

    document.body.addEventListener('mousemove', function (evt) {
      if (rotating && (evt.webkitMovementY !== 0 || evt.webkitMovementX !== 0)) {
        // mouse movement in the x-axis causes cube rotation around the y-axis and vice-versa
        xrot = xrot - evt.webkitMovementY/2;
        yrot = yrot + evt.webkitMovementX/2;
        rotatorDiv.style.webkitTransform = "rotateY(" + yrot + "deg) rotateX(" + xrot + "deg)";
      }
    },false);

    function addFaceIndicators() {
      function makeFaceIndicator(direction,text) {
        var indicator = Builder.DIV({class: "indicator " + direction}, text);
        var indicatorContainer = Builder.DIV({class: "indicator-container " + direction}, [indicator]);
        rotatorDiv.appendChild(indicatorContainer);
      }

      Faces.forEach(function (face) {
        makeFaceIndicator(FaceNames[face].toLowerCase(), face);
      });
    }

    return {
      setCubeView: function (newCubeView) {
        if (cubeView !== undefined) {
          rotatorDiv.removeChild(cubeView);
        }
        cubeView = newCubeView
        rotatorDiv.appendChild(cubeView);
      },
      getRotatorDiv: function () {
        return rotatorDiv;
      }
    };
  }());

  var cubeView = makeCubeView(Cube,'X');
  rotator.setCubeView(cubeView.getCubeDiv());

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
    'L' : "L'"
  };

  var layerAnimations = {
    "U"   : ["Y", 0, "cw"],
    "U'"  : ["Y", 0, "ccw"],
    "D"   : ["Y", 2, "cw"],
    "D'"  : ["Y", 2, "ccw"],
    "B"   : ["Z", 0, "cw"],
    "B'"  : ["Z", 0, "ccw"],
    "F"   : ["Z", 2, "cw"],
    "F'"  : ["Z", 2, "ccw"],
    "R"   : ["X", 2, "cw"],
    "R'"  : ["X", 2, "ccw"],
    "L"   : ["X", 0, "cw"],
    "L'"  : ["X", 0, "ccw"]
  };

  var inRotationAnimation = false;
  document.body.addEventListener('keypress', function (evt) {
    var key = evt.keyCode || evt.which,
        keychar = String.fromCharCode(key),
        move = moves[keychar];

    if (move !== undefined) {
      if (inRotationAnimation == true) {
        // TODO: queue move to finish after current move ends
        return;
      }

      var animationInfo = layerAnimations[move];

      inRotationAnimation = true;

      cubeView = makeCubeView(Cube,animationInfo[0]);
      rotator.setCubeView(cubeView.getCubeDiv());
      cubeView.rotateAfterDelay(animationInfo[1],animationInfo[2],function() {
        Cube.move(move);
        Cube.printCube();
        Validator.validate(Cube);
        cubeView = makeCubeView(Cube,'X');
        rotator.setCubeView(cubeView.getCubeDiv());
        inRotationAnimation = false;
      });
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
