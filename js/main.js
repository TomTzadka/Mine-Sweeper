'use strict'

var gBoard
// minesAroundCount: 4,
// isShown: true, isMine: false,
// isMarked: true

var gLevel = { SIZE: 4, MINES: 2 };
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

const MINE = '🧨';
const FLAG = '🏴‍☠️';
var currNumOfFlag = gLevel.MINES;
var gNumOfMarkd = 0;

var gIsTimerWork
var gTotalMiliSeconds = 0.00;
var gTimeStart;

// This is called when page loads

function init() {

    gBoard = buildBoard();
    renderBoard(gBoard, '.board-container')
    createMines(gBoard)

}
// Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}
// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(elCell) { /// start with board
    var minesCount = 0;
    var cellCoords = getCallCoords(elCell.id)
    var diff = 1
    if (gBoard[cellCoords.i][cellCoords.j].isMine) return;
    for (var i = cellCoords.i - diff; i <= cellCoords.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue; /// check border
        for (var j = cellCoords.j - diff; j <= cellCoords.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue; /// check border
            var nextCell = { i: i, j: j }
            if (nextCell.i === cellCoords.i && nextCell.j === cellCoords.j) {///dont check click
                continue
            } else {
                if (gBoard[nextCell.i][nextCell.j].isMine) minesCount++;
            }
        }
    }
    return minesCount;
}



// Render the board as a <table> to the page
function renderBoard(board, selector) {
    document.querySelector('#number-of-flag').innerText = gLevel.MINES /// update flag

    var strHTML = '<table border="1"><tbody>';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            // var cell = board[i][j];
            // var className = `cell cell${i}-${j}`;
            strHTML += `<td id="${i}-${j}" class="cell cell${i}-${j}"  onmousedown="whichButton(event, this)" oncontextmenu="event.preventDefault();">`

            if (gBoard[i][j].isMine) {
                strHTML += `<span class="show"></span></td>`
            }
            strHTML += `<span class="show"></span></td>` /// empty
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}
// Called when a cell (td) is clicked
function cellClicked(elCell) {
    console.log('currNumOfFlag', currNumOfFlag);
    if (!gIsTimerWork) {
        gTimeStart = setInterval(setTime, 10);
    }
    gIsTimerWork = true;
    cellMarked(elCell)

}
// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell) {
    
    gGame.shownCount++

    var cellIdx = getCallCoords(elCell.id);
    var i = cellIdx.i
    var j = cellIdx.j

    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        /// update model
        gBoard[i][j].isShown = true;
        var numOfMines = setMinesNegsCount(elCell)
        gBoard[i][j].minesAroundCount = numOfMines

        ///update dom
        elCell.style.backgroundColor = 'rgb(204, 231, 225)'
        if (gBoard[i][j].isMine) {
            elCell.innerText = MINE
            gameOver()
        } else if (!gBoard[i][j].minesAroundCount) {
            expandShown(elCell, i, j)

        } else {
            elCell.innerText = numOfMines;
        }
    }
    if (gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES &&
        gGame.markedCount === gLevel.MINES) victory();

    console.log('gGame.shownCount', gGame.shownCount);
    console.log('gGame.markedCount', gGame.markedCount);
}

function putFlag(elCell) {
    var cellIdx = getCallCoords(elCell.id);
    var i = cellIdx.i;
    var j = cellIdx.j;
    if (!gBoard[i][j].isShown) {
        if (gBoard[i][j].isMarked) {
            // update model
            gBoard[i][j].isMarked = false;
            currNumOfFlag++;
            gGame.markedCount--; 
            //update dom
            elCell.innerText = '';
            document.querySelector('#number-of-flag').innerText = currNumOfFlag;
        } else {
            // update model
            gBoard[i][j].isMarked = true;
            currNumOfFlag--;
            gGame.markedCount++; 
            //update dom
            elCell.innerText = FLAG;
            document.querySelector('#number-of-flag').innerText = currNumOfFlag;

        }
    }
    if (gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES &&
        gGame.markedCount === gLevel.MINES) victory();
    console.log('gGame.shownCount', gGame.shownCount);
    console.log('gGame.markedCount', gGame.markedCount);
}
// Game ends when all mines are marked, and all the other cells are shown
function gameOver() {
    /// update model of game
    gGame.isOn = false 
    ///update dom
    var elFace = document.getElementById('new-game')
    elFace.innerText = '😖'

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) {
                // update model of cell
                gBoard[i][j].isShown = true;
                /// update dom of cell
                // var elCell= document.querySelector(`#${i}-${j}`)
                var elCell = document.getElementById(`${i}-${j}`)

                console.log('elCell', elCell);
                elCell.innerText = MINE;
                elCell.style.backgroundColor = 'rgb(245, 119, 119)';
                console.log('mine', gBoard[i][j]);
            }
        }
    }
}

function victory() {
    console.log('victory');
}
// When user clicks a cell with no mines around, we need to open not only that cell,
// but also its neighbors. NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors

function whichButton(event, elCell) {
    gGame.isOn = true
    var mouseButton = event.which;
    if (mouseButton === 1) cellMarked(elCell);/// Right click
    if (mouseButton === 3) putFlag(elCell);/// Left click

}
function expandShown(elCell) {
    var cellIdx = getCallCoords(elCell.id);
    var i = cellIdx.i;
    var j = cellIdx.j;

    var diff = 1;
    for (var a = i - diff; a <= i + 1; a++) {
        if (a < 0 || a >= gBoard.length) continue; /// check border
        for (var b = j - diff; b <= j + 1; b++) {
            if (b < 0 || b >= gBoard.length) continue; /// check border
            if (a === i && b === j) continue; /// check me
            if (gBoard[a][b].isShown) continue/// chech show
            if (gBoard[a][b].isMine) continue; // check mine
            var nextCell = document.querySelector(`.cell${a}-${b}`)
            cellMarked(nextCell)

        }
    }
}

// var gLevel = { SIZE: 4, MINES: 2 };
function level(elBtn) {
    var elSizeClicked = +elBtn.innerText
    /// update model
    if (elSizeClicked === 12) {
        gLevel = { SIZE: 12, MINES: 30 };
    } else if (elSizeClicked === 8) {
        gLevel = { SIZE: 8, MINES: 12 }

    } else gLevel = { SIZE: 4, MINES: 2 } /// for default
    //update dom
    document.querySelector('#number-of-flag').innerText = currNumOfFlag
    newGame()
}

function newGame() {
    // var gLevel = { SIZE: 4, MINES: 2 };
    // update dom
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    //update model
    var elFace = document.getElementById('new-game')
    elFace.innerText = '😁'
    init()
}


function createMines(board) {
    var mines = []
    for (var i = 0; i < gLevel.MINES; i++) {
        var currMine = mines[i]
        currMine = createMine(board)
        mines.push(currMine)
    }
    gLevel.MINES = mines.length
    console.log('gLevel.MINES',gLevel.MINES);
    return mines
}

function createMine(board) {
    var mine = {
        i: getRandomInt(0, board.length - 1),
        j: getRandomInt(0, board.length - 1)
    };
    gBoard[mine.i][mine.j].isMine = true

    return mine;
}

// console.log('createMines()',createMines());
