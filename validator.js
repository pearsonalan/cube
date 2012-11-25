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
    var labels = getSubCubeLabels(cube,subcube);
    if (validValues[labels] === true) {
      return true;
    } else {
      console.log("Discovered invalid piece: colors " + labels + " at " + subcube);
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
