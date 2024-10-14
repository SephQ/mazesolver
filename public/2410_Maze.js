// Maze Solver
const startSymbol = "S";
const endSymbol = "E";

let mazeInput = document.querySelector("#maze-input");  // Update variable for input
const mazeOutput = document.querySelector("#maze-output");
const solveButton = document.getElementById("solve");
const randomiseButton = document.getElementById("randomise");
const solvableRandomiseButton = document.getElementById("solvable-randomise");
const bunnyMazeButton = document.getElementById("bunny");
const randHeightInput = document.getElementById("rand-height");
const randWidthInput = document.getElementById("rand-width");
let solved = false;

// Set defaults for the randomise input dimensions
const defaultHeight = 39;
const defaultWidth = 67;
randHeightInput.value = defaultHeight;
randWidthInput.value = defaultWidth;


setInitialMaze();  // Set the initial maze as default
// Load the initial state
let mazeInputText = mazeInput.value;
let mazeArray = mazeInputText.split("\n").map((line) => line.toUpperCase().split(""));

solveButton.addEventListener('click', solveHandler);
randomiseButton.addEventListener('click', randomiseHandler.bind(
  this, false
));
solvableRandomiseButton.addEventListener('click', randomiseHandler.bind(
  this, true
));
bunnyMazeButton.addEventListener('click', bunnyMazeHandler);
mazeInput.addEventListener('input', inputChangeHandler)

inputHandler();  // Initialize input to HTML default maze (until user edits it)

function inputChangeHandler() {
  mazeInput.value = this.value;
  inputHandler();
}
function inputHandler() {
  // mazeInput.addEventListener('input', (e) => { mazeInput.value = e.target.data })  // Update Handler ?? TODO: Check best practice 
  mazeInputText = mazeInput.value  //.split("\n").map((line) => line.toUpperCase().split(""));
  mazeArray = mazeInputText.split("\n").map((line) => line.toUpperCase().split(""));
  solved = false;
  mazeOutput.value = "";
  // mazeArray = mazeInput.value.split("\n").map((line) => line.toUpperCase().split(""));  // 241005 rm
  // .toUpperCase() to allow either "s"&"e" or "S"&"E" for start and ending
  console.log(mazeInputText);
  // console.log(mazeArray.map((r) => {return r.join("")} ).join("\n"));
}
function solveHandler() {
  // console.log(mazeInput.value);
  inputHandler();  // Update input from text area

  if (
    !mazeArray.flat().includes(startSymbol) ||
    !mazeArray.flat().includes(endSymbol)
  ) {
    console.log("No solution, needs S and E symbols");
    mazeOutput.value = "No solution, needs S and E symbols";  // If there is no start or end symbol, then let the user know
  } else {
    this.checked = [];  // the checked array (nodes in any path)
    this.h = mazeArray.length;
    // this.w = mazeArray[0].length;
    this.w = Math.max( ...mazeArray.map((x) => { 
      return x.length
    }) );

    const startY = mazeArray.findIndex((row) => row.includes(startSymbol));
    const startX = mazeArray[startY].indexOf(startSymbol);

    const visited = [];  // the visited array (nodes in this path)
    let solution = search.call(this, [startX, startY], endSymbol, visited);
    if (!solved) {
      console.log("No solution");
      mazeOutput.value = "No solution";  // If there was no solution, let the user know
    }
  }

}
function validDimensions(h, w) {
  const MAX_HEIGHT = 100;
  const MAX_WIDTH = 300;
  if (h === 0 && w === 0) {
    // User wants height and width randomised
    h = parseInt(Math.random() * (MAX_HEIGHT - 1)) + 1;
    w = parseInt(Math.random() * (MAX_WIDTH - 2)) + 2;
    return [h, w];
  }
  if (
    h < 1 || h > MAX_HEIGHT || isNaN(h) ||
    w < 2 || w > MAX_WIDTH || isNaN(w)

  ) {
    const invalidText = `Invalid dimensions (H x W) (${h} x ${w}).
Allowed ranges:
1 ≤ H ≤ ${MAX_HEIGHT}
2 ≤ W ≤ ${MAX_WIDTH}`
    console.log(invalidText);
    mazeOutput.value = invalidText;  // If there were invalid dimensions, let the user know
    return false;
  }
  return [h, w];
}
function randomiseHandler(forceSolvable = false) {
  // Randomise the map into a new one with size HEIGHT and WIDTH
  // Use "S" and "E" for start and end
  let height = +randHeightInput.value;
  let width = +randWidthInput.value;
  let dimensions = validDimensions(height, width);
  if (dimensions === false) {
    return
  } else {
    height = dimensions[0];
    width = dimensions[1];
  }
  // Set the size of the input and output to the dimensions + some buffer
  // https://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
  const boxHeight = height * 2 + 10;
  const boxWidth = width + 30;
  const newStyle = `height: ${boxHeight}ch; width: ${boxWidth}ch; font: courier`
  mazeInput.style = newStyle;
  mazeOutput.style = newStyle;

  function randRow(i = 0) {
    let randBit = "";
    if (i % 2 == 0) {
    randBit = xRand.map((i) => { 
        return Math.random() > 0.5 ? "+--" : "+  "
      }).join("");
      return randBit + "+";
    } else {
    randBit = xRand.map((i) => { 
        return (i == 0 || Math.random() > 0.5) ? "|  " : "   "
      }).join("");
      return randBit + "|";
    }
  }
  const W_THIRD = parseInt((width - 1) / 3);
  const y = [...Array(height).keys()];
  const x = [...Array(width).keys()];
  const xRand = [...Array(W_THIRD).keys()];  // Since mazes are drawn with 3 horizontal spaces for each vertical
  let finalMap;
  let map;
  let row;
  solved = false;

  while (!solved) {
    map = []
    y.forEach( (j, idx) => {
      row = (idx == 0 || idx == height - 1) ? "+--".repeat(W_THIRD) + "+" : randRow(idx)
      map.push(row)
      }
    )

    finalMap = randomiseEntry(map).join("\n");
    console.log(finalMap)
    mazeInput.value = finalMap  // Update HTML
    inputHandler();    // Call input handler to update input to variables
    // Call the Solver
    solveHandler();
    if (!forceSolvable) {
      break;  // Only keep searching for solvable mazes if we are limiting entry to solvable ones
    }
  }
  
  return finalMap;    // For debugging
  
  function randomiseEntry(map) {
    // Start is always on the north or west border, End on East or South
    const limitEntry = true;    // Prevent placement of start and end on "+" positions (corners)
    let h, w;
    let validCols = [...Array(width).keys()].filter( (i) => { return i % 3 > 0 } );
    let firstRow = map[0].split("");
    let lastRow = map[height-1].split("");
    if (limitEntry) {
      h = parseInt((height - 1) / 2);
      w = parseInt(2 * (width - 1) / 3);
    } else {
      h = height;
      w = width;
    }
    const totalOptions = h + w;
    let startSeed = parseInt((totalOptions + 0.5 - 1e-9) * Math.random());
    let endSeed = parseInt((totalOptions + 0.5 - 1e-9) * Math.random());
    // Note: +0.5 to ensure rounding down doesn't make the biggest number half as likely as all others, makes it 'fair'. +0.499... would be ideal hence the -1e-9, preventing HEIGHT+WIDTH as a result (0->HEIGHT+WIDTH-1).
    console.log('h,w,totalOptions,HEIGHT,WIDTH,startSeed,endSeed,startSeed*2+1,endSeed*2+1')
    console.log(h,w,totalOptions,height,width,startSeed,endSeed,startSeed*2+1,endSeed*2+1)
    // If startSeed < h, then it's on the West side in that row.
    // If endSeed < h, then it's on the East side in that row.
    if (startSeed < h) {
      startSeed = startSeed * 2 + 1;
      if (startSeed == height) startSeed--;
      let row = map[startSeed].split("");
      row[0] = startSymbol;
      map[startSeed] = row.join("");
    } else {
      if (startSeed == totalOptions) startSeed--;
      let col = validCols[startSeed - h]
      firstRow[startSeed] = startSymbol;
      map[0] = firstRow.join("");
    }
    if (endSeed < h) {
      endSeed = endSeed * 2 + 1;
      if (endSeed == height) endSeed--;
      let row = map[endSeed].split("");
      row[width-1] = endSymbol;
      map[endSeed] = row.join("");
    } else {
      if (endSeed == totalOptions) endSeed--;
      let col = validCols[endSeed - h];
      lastRow[col] = endSymbol;
      map[height-1] = lastRow.join("");
    }
    return map
  }
}
function bunnyMazeHandler() {
  mazeInput.value = 
` .===============================================================.
 |  ,-----------------,                                          |
 | /| HÉLP THÉ BUNNY  |==========.===.   .===.   .===========.   |
 || |    FIND HIŚ     |          |   |   |   |   |      .-.  | E |
 || |  ÉAŚTÉR ÉGG !   |  |===|   |   |   |   |   |..==./xxx\\ | N |
 || |_________________|          |   |       |   /<<<<<\\    || D |
 ||/_________________/   .======='   |   .   |   \\>>>>>/xxxx/--. |
 |   |   |           |   |           |   |   |   |\`'==''---; * *\`\\
 |   |   '==========='   |   |======='   |   |   |   ,===. \\* * */
 |   |                   |               |   |   |   |   |  '--'\`|
 |   '===============|   '===.   |===.   |   |   |==='   '=======|
 |                           |       |   |   |   |               |
 |   |===============.   .   '===|   |   |===|   |   .=======.   |
 |                   |   |           |   |   |   |   |       |   |
 |   .===========.   |   |   |===.   |   |   |   |   |   |   |   |
 |   |           |   |   |       |   |   |   |   |   |   |   |   |
 |   |   .===.   |   |   |===.   '===|   |   '==='   |   |   |   |
 |   |   |   |   |   |   |   |       |   |           |   |   |   |
 |   '==='   /\`\\ '==='   |   '===.   |   '===========|   |   |   |
 |          / : |                |   |               |   |   |   |
 | _.._=====| '/ '===|   .======='   '===========.   |   |   |   |
 /\`    \\    | /          |                       |   |   |       |
|  .-._ '-"\` (=======.   |   .===============.   |   |   '===.   |
|_/  |/   o  o\\==.   |   |   |               |   |   |       |   |
 | S ||  >   @ )<|   |   |   |   .=======.   |   |   |===.   |   |
 | T | \\  '--\`/  |   |   |   |   |       |   |   |   |   |   |   |
 | A | / '--<\`   |   |   |   |   |   |   |   |   '==='   |   '   |
 | R || ,    \\\\  |           |   |   |   |   |           |       |
 | T |; ;     \\\\__'======.   |   |   '==='   |   .===.   |   |   |
 |   / /      |.__)==,   |   |   |           |   |   |   |   |   |
 |  (_/,--.   ; //"""\\\\  |   |   '==========='   |   '==='   |   |
 |  { \`|   \\_/  ||___||  |   |                   |           |   |
 |   ;-\\   / |  |(___)|  |   '===========.   |   '=======.   |   |
 |   |  | /  |  |XXXXX|  |               |   |           |   |   |
 |   | /  \\  '-,\\XXXXX/  |   .==========='   '=======.   |   |   |
 |   | \\__|----' \`"""\`   |   |                       |   |   |   |
 |   '==================='   '======================='   '==='   |
 |                                                               |
 '==jgŚ=='01=====================================================.`;
 // Set solved state to false
 solved = false;
 mazeOutput.value = "";
}
function setInitialMaze() {
  mazeInput.value = 
`+--+--+--+--+--+--+--+--+--+--+S-+--+--+--+--+--+--+--+--+--+--+--+
|  |  |  |  |           |  |  |        |  |  |     |        |  |  |
+--+--+  +--+  +  +  +--+  +  +  +  +  +  +  +  +--+  +  +  +--+--+
|     |        |  |           |  |  |              |     |  |     |
+  +--+  +--+  +  +--+  +--+--+--+  +--+--+  +  +--+--+--+  +--+--+
|     |  |  |        |        |     |     |              |        |
+  +  +  +  +--+  +  +  +  +--+  +  +--+  +  +  +  +  +--+--+--+  +
|     |  |  |  |              |                    |     |  |     |
+  +--+  +--+--+  +--+  +--+  +--+  +--+--+--+--+--+  +  +--+--+  +
|           |  |        |        |  |  |  |           |  |  |     |
+  +--+  +--+  +--+--+--+--+--+  +  +--+  +  +  +  +--+  +  +--+--+
|  |        |        |  |  |  |     |  |  |  |  |  |  |  |        |
+--+--+  +--+  +--+  +  +  +--+  +--+--+--+--+  +--+--+  +--+--+  +
|  |  |     |                             |        |  |     |     |
+  +--+--+--+--+  +  +--+--+--+--+--+--+  +--+  +  +--+  +--+--+  +
|  |  |  |     |        |     |     |        |     |        |     |
+  +  +  +  +--+  +  +  +--+--+  +--+--+  +  +--+--+  +--+  +  +  +
|  |        |     |  |           |  |           |  |     |     |  |
+--+--+  +  +--+--+--+--+  +  +  +  +--+--+  +  +--+--+  +  +  +--+
|     |     |        |     |        |  |     |                    |
+--+--+--+--+  +  +--+--+--+  +--+  +--+  +  +--+--+  +  +  +--+  +
|  |        |  |  |  |  |  |        |     |           |  |  |     |
+  +--+--+  +  +  +  +  +  +  +--+  +  +  +  +  +--+--+--+  +  +  +
|        |  |        |  |  |     |  |  |     |  |  |  |  |     |  |
+--+  +  +--+  +--+--+--+--+  +  +  +--+  +  +  +--+--+--+--+--+--+
|  |           |  |  |  |     |     |     |              |     |  |
+--+  +--+--+--+  +--+  +  +  +--+  +  +  +  +  +--+--+  +  +--+--+
|     |  |     |  |  |  |                 |     |  |  |  |  |     |
+  +  +--+--+--+  +  +--+  +--+  +--+  +  +--+--+  +--+  +--+--+  +
|        |     |     |  |     |     |  |  |  |  |  |              |
+  +  +  +  +--+--+--+  +  +--+  +  +--+--+  +--+--+--+  +--+--+  +
|                 |  |     |  |  |  |     |                 |  |  |
+  +--+  +--+--+  +--+  +--+  +  +  +--+--+--+--+  +--+  +  +  +--+
|  |  |     |        |  |           |  |     |     |  |  |  |  |  |
+--+  +  +  +--+  +  +--+  +--+  +--+  +--+  +  +--+--+  +  +  +  +
|     |  |           |  |  |  |     |        |     |  |        |  |
+  +--+  +--+--+--+--+  +  +--+  +  +  +  +--+  +--+--+--+--+  +--+
|        |     |  |        |  |  |  |  |  |  |                 |  |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+E-+--+--+--+--+`;
 // Set solved state to false
 solved = false;
 mazeOutput.value = "";
}
function content(node) {
  // Gives the content of the maze's jth row and ith column or null if out-of-bounds
  const [i, j] = node;
  if (!mazeArray[j] || !mazeArray[j][i]) return null;
  return mazeArray[j][i];
}

function options(node, visited) {
  // Gives the options to travel from node, removing illegal positions (out-of-bounds, walls and back-tracking)
  const [x, y] = node;
  const newVisited = visited.slice(); // Shallow copy
  const list = [
    [x + 1, y],
    [x, y + 1],
    [x, y - 1],
    [x - 1, y],
  ]
    .filter(([i, j]) => i >= 0 && j >= 0 && i < this.w && j < this.h) // Ensure within bounds
    .filter(([i, j]) => !newVisited.some(([vi, vj]) => vi === i && vj === j)); // Avoid visited nodes

  // Only allow moving into spaces that are not walls
  return list.filter(([i, j]) =>
    [" ", endSymbol].includes(content.call(this, [i, j]))
  );
}

function search(start, goal, visited) {
  // Search for a path from start to goal nodes and track the path of node val's travelled in 'visited'
  const val = content.call(this, start);
  if (
    val === null ||
    this.checked.some(([ci, cj]) => ci === start[0] && cj === start[1])
  )
    return [];  // Skip this node if it's invalid or has already been checked

  const newVisited = visited.slice(); // Shallow copy
  newVisited.push(start);  // Update the visited array (nodes in this path)
  this.checked.push(start);  // Update the checked array (nodes in any path)

  if (val === goal) {
    return finish.call(this, newVisited);
  }
  const opt = options.call(this, start, newVisited);
  return opt.flatMap((node) => search.call(this, node, goal, newVisited));
}

function shorten(path) {
  let last = 0;
  while (last !== path.length) {
    last = path.length;

    const badTurn = path.slice(0, -2).find(([x, y], i) => {
      const rest = path.slice(i + 2);
      const neighbours = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      return neighbours.some((k) =>
        rest.some(([rx, ry]) => k[0] === rx && k[1] === ry)
      );
    });

    // If there is a clear redundant path, cut it off.
    // Only works when the path comes back to an adjacent cell.
    // TODO: allow for shortening paths when the adjacency is more than a cell away, but it's whitespace between.
    if (badTurn) {
      const [x, y] = badTurn;
      const i = path.indexOf(badTurn);
      const neighbours = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      const fixTurn = path
        .slice()
        .reverse()
        .find((k) => neighbours.some(([nx, ny]) => k[0] === nx && k[1] === ny));
      const j = path.indexOf(fixTurn);
      path = [...path.slice(0, i + 1), ...path.slice(j)];
    }
  }
  return path;
}

function finish(path) {
  path = shorten(path); // Shorten the path first

  // Iterate over the path to mark directions (skip start)
  for (let idx = 1; idx < path.length - 1; idx++) {
    const [i, j] = path[idx]; // Current position
    const [u, v] = path[idx + 1]; // Next position in the path
    const walkSymbol = "■"; // u > i ? "→" : u < i ? "←" : j > v ? "↑" : "↓";

    // Only modify the path cells that are spaces or the start (don't overwrite walls)
    if (mazeArray[j][i] === " " || mazeArray[j][i] === startSymbol) {
      mazeArray[j][i] = walkSymbol;
    }
  }

  // Print the maze while preserving the structure
  const output = mazeArray.map((row) => row.join("")).join("\n");
  console.log(output);
  mazeOutput.value = output;
  solved = true;
}