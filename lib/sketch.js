'use strict'; // Required for p5 editor to accept let and const.

// Initialize data, CA object, and canvas parent.

let data;
let CA;

function setFormDefaults() {
  // Get elements, loop over them, and set them to defaults.
  const elements = document.getElementById('settingsForm').elements;
  for (let i = 0; i < elements.length; i++) {
    const e = elements.item(i);
    if (e.type === 'radio') {
      switch (e.name) {
        case '001':
          e.checked = true;
          break;
        case '011':
          e.checked = true;
          break;
        case '100':
          e.checked = true;
          break;
        case '110':
          e.checked = true;
          break;
      }
    } else if (e.type !== 'radio') {
      // Don't change radio elements.
      switch (e.name) {
        case 'cells':
          e.value = '505';
          break;
        case 'rows':
          e.value = '505';
          break;
        case 'initialStates':
          e.value = '00000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000'.repeat(5);
          break;
      }
    }
  }
}

// Function for collecting CA settings.
function getFormValues(event) {
  event.preventDefault();
  clear(); // Clear canvas.
  data = {}; // Clear data.

  // Get elements, loop over them, and store them.
  const elements = document.getElementById('settingsForm').elements;
  for (let i = 0; i < elements.length; i++) {
    const e = elements.item(i);
    if (e.type !== 'radio' || e.checked) {
      // If it's a radio input only store it if it's checked.
      data[e.name] = e.value;
    }
  }

  // Turn cells and rows into numbers.
  data.cells = Number(data.cells);
  data.rows = Number(data.rows);

  // Validate inputs.
  if (data.cells > 1000 || data.cells < 1) {
    text('Invalid cell number.', width / 2 - 58, 20);
    return false;
  }
  if (data.rows > 1000 || data.rows < 1) {
    text('Invalid rows number.', width / 2 - 58, 20);
    return false;
  }
  if (data.initialStates.length !== data.cells) {
    text('Cell count must equal initial states length.', width / 2 - 58, 20);
    return false;
  }

  // Update CA.
  CA.updateData(data);
  // Scroll to bottom at rate similar to drawing speed.
  $("html, body").animate({ scrollTop: $(document).height() }, data.rows / 30 * 1000);
  return false;
}

class CellularAutomaton {
  constructor() {
    this.cells = []; // Current cell states.
    this.rows = 0; // Number of rows.
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.rules = {}; // Rules object.
    this.genCount = 0; // Tells us the current generation when drawing.
  }

  // Update CA data with form data.
  updateData(data) {
    this.cells = data.initialStates.split('');
    this.rows = data.rows;
    this.cellHeight = height / this.rows;
    this.cellWidth = width / this.cells.length;
    this.rules['000'] = data['000'];
    this.rules['001'] = data['001'];
    this.rules['010'] = data['010'];
    this.rules['011'] = data['011'];
    this.rules['100'] = data['100'];
    this.rules['101'] = data['101'];
    this.rules['110'] = data['110'];
    this.rules['111'] = data['111'];
    this.genCount = 0; // Start again from generation 0.
  }

  // Compute the next generation state for a cell based on the current rules.
  nextState(left, current, right) {
    const string = "" + left + current + right;
    return this.rules[string];
  }

  // Advances current cell states to the next generation.
  advanceGeneration() {
    const nextGeneration = [0];
    for (let i = 1; i < this.cells.length - 1; i++) {
      const left = this.cells[i - 1];
      const current = this.cells[i];
      const right = this.cells[i + 1];
      nextGeneration[i] = this.nextState(left, current, right);
    }
    nextGeneration.push(0);
    this.cells = nextGeneration;
    this.genCount++;
  }

  // Draws the cells.
  display() {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] === '1') {
        fill('#F3F2F2');
      } else {
        fill('#2F4F4F');
      }
      rect(i * this.cellWidth, this.genCount * this.cellHeight, this.cellWidth, this.cellHeight);
    }
  }
}

function setup() {
  const canvas = createCanvas(0, 0);
  canvas.parent('#canvas-parent');
  resizeCanvas(windowWidth, windowHeight);
  stroke('#2F4F4F');
  CA = new CellularAutomaton();
  setFormDefaults();
}

function draw() {
  // Only draw if we have data and CA hasn't reached the bottom of the window.
  if (data && CA.genCount < CA.rows) {
    CA.display();
    CA.advanceGeneration();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}