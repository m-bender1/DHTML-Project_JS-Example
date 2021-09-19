/*
   Matt Bender
   JS spreadsheet project
   October 19, 2020
*/

// global vars
var userInput = document.getElementById("userInput");
var tableDiv = document.getElementById("tblDiv");
var resetBtn = document.getElementById("resetBtn");
var clearBtn = document.getElementById("clearBtn");
var tblArray = [];
var cells = []; // this is for later, when clearing spreadsheet, etc...

// table rows and colums
const TBLCOLUMNS = 10;
const TBLROWS = 20;
const COLHEAD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


// onload function generating empty table 
function generateTable() {
   // table declaration
   let tbl = "<table class='tbl'>";
   // column header lables
   tbl += "<tr><th></th>";
   for (let i = 0; i < TBLCOLUMNS; i++) {
      tbl += "<th>" + COLHEAD.charAt(i) + "</th>";
   }
   // end header row
   tbl += "</tr>";
   // rows/cells
   for (let i = 1; i <= TBLROWS; i++) {
      tbl += "<tr>";
      // set id for each td for later on when selecting cells
      // this is the fist col of row (the 1-20 labels)
      tbl += "<td id='" + i + "_0' class='baseCol'>" + i + "</td>";
      for (let c = 0; c < TBLCOLUMNS; c++) {
         tbl += "<td id='" + i + "_" + COLHEAD.charAt(c) + "' class='alphaCol' onclick='pickCell(this)'></td>";
      }
      tbl += "</tr>";
   }
   tbl += "</table>";
   tableDiv.innerHTML = tbl;
}

// populate tbl array with all cells
for (i = 0; i < TBLROWS; i++) {
   tblArray[i] = [];
   for (j = 0; j < TBLCOLUMNS; j++) {
      tblArray[i][j] = "";
   }
}

function pickCell(cell) {
   var selectedCell = document.getElementById("selectedCell");
   selectedCell.value = cell.id.replace("_", ""); // removing the underscore and displaying the current cell in txtbox

   if (cell.innerHTML != null) {
      if (selectedCell.value.charAt(0) == cell.id.charAt(0) && selectedCell.value.charAt(1) == cell.id.charAt(2)) {
         userInput.value = tblArray[cell.id.charAt(0)][COLHEAD.indexOf(cell.id.charAt(2))];
      }
      // id's over 9
      else if (cell.id.charAt(1) != '_') {
         if (selectedCell.value.charAt(0) == cell.id.charAt(0) && selectedCell.value.charAt(1) == cell.id.charAt(1)
            && selectedCell.value.charAt(2) == cell.id.charAt(3)) {
            userInput.value = tblArray[(cell.id.charAt(0)) + (cell.id.charAt(1))][COLHEAD.indexOf(cell.id.charAt(3))];
         }
      }
   }


   // when enter key is pressed in userInput, adds the value to cell
   window.addEventListener("keypress", function () {
      // check for enter key press
      if (window.event.keyCode === 13) {
         // ensure id's are matching 
         if (selectedCell.value.charAt(0) == cell.id.charAt(0) && selectedCell.value.charAt(1) == cell.id.charAt(2)) {
            // if formula exists, calculates. if not, outputs textbox value to cell
            tblArray[cell.id.charAt(0)][COLHEAD.indexOf(cell.id.charAt(2))] = userInput.value;
            recalculate(cell, false);
         }
         // id's over 9
         else if (cell.id.charAt(1) != '_') {
            if (selectedCell.value.charAt(0) == cell.id.charAt(0) && selectedCell.value.charAt(1) == cell.id.charAt(1)
               && selectedCell.value.charAt(2) == cell.id.charAt(3)) {
               // ran out of time getting id's 10+ to calculate
               tblArray[(cell.id.charAt(0)) + (cell.id.charAt(1))][COLHEAD.indexOf(cell.id.charAt(3))] = userInput.value;
               recalculate(cell, true);
            }
         }
         cells.push(cell);
      }
   });

   // unselect btn makes it so no cells are selected
   // since the selectedCell value must match cell.id in above if statement, this makes it so no cell is selected
   clearBtn.addEventListener("click", function () {
      selectedCell.value = "";
      userInput.value = ""; // clear previous selected cells value;
   });

   // clear entire 
   resetBtn.addEventListener("click", function () {
      for (let i = 0; i < cells.length; i++) {
         cells[i].innerHTML = "";
      }
      selectedCell.value = "";
      userInput.value = "";
      //clear arr
      for (i = 0; i < TBLROWS; i++) {
         for (j = 0; j < TBLCOLUMNS; j++) {
            tblArray[i][j] = "";
         }
      }
   });
}


// determines if user entered a formula such as =SUM(A1:B2)
// returns an array with formula components
function getFormula(tbValue) {
   var pattern = /[:|\(|\)]/;
   var ar = tbValue.split(pattern);
   var sum = ar[0].toUpperCase();

   if (ar.length < 3)
      return null;
   else if (sum !== "=SUM")
      return null;
   else
      return ar;
}

// ******************************************
// traverse the 2d array looking for formulas
// and then recalculate cell values
// tblArray is the 2d JS array
function recalculate(cell, check) {
   for (let i = 0; i < TBLROWS; i++) {
      for (let j = 0; j < TBLCOLUMNS; j++) {
         // check to see if table element is a formula
         if (check == false) {
            if (tblArray[cell.id.charAt(0)][COLHEAD.indexOf(cell.id.charAt(2))].indexOf("=SUM") !== -1) {
               // apply the formula for cell at row/column i/j
               calculateCell(i, j, cell, check);
            }
            else if (tblArray[cell.id.charAt(0)][COLHEAD.indexOf(cell.id.charAt(2))].indexOf("=SUM") == -1) {
               document.getElementById(cell.id).innerHTML = userInput.value;
            }
         }
         // if over == true, then the id is 10 or up, so 2 indexes need to be checked in tblArr[i]
         if (check == true) {
            if (tblArray[(cell.id.charAt(0)) + (cell.id.charAt(1))][COLHEAD.indexOf(cell.id.charAt(3))].indexOf("=SUM") !== -1) {
               // apply the formula for cell at row/column i/j
               calculateCell(i, j, cell, check);
            }
            else if (tblArray[(cell.id.charAt(0)) + (cell.id.charAt(1))][COLHEAD.indexOf(cell.id.charAt(3))].indexOf("=SUM") == -1) {
               document.getElementById(cell.id).innerHTML = userInput.value;
            }
         }
      }
   }
}

// takes in row and column for token arr, the cell to check it's id,
// over is flag var for checking if id is over 10 (false = under 10),
// finds ids from token arr, adds the valuest to 'sumTotal' and outputs to cell 
function calculateCell(row, column, cell, over) {
   // begin by getting the formula parts
   var tokenArray = getFormula(tblArray[row][column]);
   var ref1;
   var ref2;

   if (tokenArray != null) {
      if (over == false) {
         for (i = 0; i < cells.length; i++) {
            if (cells[i].id.charAt(0) + cells[i].id.charAt(2) == tokenArray[1]) {
               ref1 = document.getElementById(cells[i].id);
            }
            else if (cells[i].id.charAt(0) + cells[i].id.charAt(2) == tokenArray[2]) {
               ref2 = document.getElementById(cells[i].id);
            }
         }
         sumTotal = parseFloat(ref1.innerHTML) + parseFloat(ref2.innerHTML);
         if (sumTotal == Number(sumTotal)) {
            document.getElementById(cell.id).innerHTML = sumTotal;
         }
         else {
            alert("One of the values in formula is not a number!");
         }
      }
      else if (over == true) {
         for (i = 0; i < cells.length; i++) {
            if ((cells[i].id.charAt(0) + cells[i].id.charAt(1)) + cells[i].id.charAt(3) == tokenArray[1]) {
               ref1 = document.getElementById(cells[i].id);
            }
            else if ((cells[i].id.charAt(0) + cells[i].id.charAt(1)) + cells[i].id.charAt(3) == tokenArray[2]) {
               ref2 = document.getElementById(cells[i].id);
            }
         }
         sumTotal = parseFloat(ref1.innerHTML) + parseFloat(ref2.innerHTML);
         if (sumTotal === Number) {
            document.getElementById(cell.id).innerHTML = sumTotal;
         }
         else {
            alert("One of the values in formula is not a number!");
         }
      }
   }
}
