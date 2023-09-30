const { Console } = require('./console');
const console = new Console();

const yesNoDialog = initYesNoDialog('Would you like to play again?');
do {
  initConnectFourView().printTitle()
  const connectFour = initConnectFour()
  connectFour.play();
  initConnectFourView(connectFour).printRoundResult()
  yesNoDialog.askToPlayAgain()
} while (yesNoDialog.isAffirmative())

function initConnectFour () {
  return {
    board: initBoard(),

    play () {
      initBoardView(this.board).printBoard();
      do {
        this.board.turn.next();
        initBoardView(this.board).turn.printTurn()
        let column = initBoardView(this.board).askColumn() - 1;
        this.board.addTokenToBoard(column);
        initBoardView(this.board).printBoard();
      } while (this.resume(this.board));
    },

    resume (board) {
      return !board.isCompleted() && !initGoal(board).anyAchived();
    }
  }
}

function initConnectFourView (connectFour) {
  return {
    printTitle () {
      console.writeln('--- CONNECT 4 ---');
    },
  
    printWinnerMsg (msg) {
      console.writeln(`${msg} WIN!!! :-)`);
    },
  
    printTieMsg () {
      console.writeln('TIED!!!');
    },

    printRoundResult () {
      initGoal(connectFour.board).anyAchived() ? this.printWinnerMsg(connectFour.board.turn.getTokenName()) : this.printTieMsg();
    }
  };
}

function initYesNoDialog (question) {
  const that = {
    question,
    answer: '',
    saveAnswer: function (answer) {
      this.answer = answer;
    }
  };

  return {
    isAffirmative: function () {
      return that.answer === 'y';
    },

    isNegative: function () {
      return that.answer === 'n';
    },

    askToPlayAgain: function () {
      let error = false;
      do {
        const answer = console.readString(that.question);
        that.saveAnswer(answer);
        error = !this.isAffirmative() && !this.isNegative();
        if (error) {
          console.writeln('Please, answer "y" or "n"');
        }
      } while (error);
    }
  };
}

function initBoard () {
  const that = {
    COLUMNS: 7,
    ROWS: 6,
    TOKEN_EMPTY: ' ',
    board: [
      [' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ']
    ],

    getLowestAvailableSpace (column) {
      for (let i = 0; i < this.ROWS; i++) {
        if (this.board[column][i] === this.TOKEN_EMPTY) { return i; }
      }
    },

  };

  return {
    isCompleted () {
      let completed = true;
      for (let i = 0; i < that.COLUMNS; i++) {
        completed &= this.columnCompleted(i);
      }
      return completed;
    },

    addTokenToBoard (column) {
      that.board[column][that.getLowestAvailableSpace(column)] = this.turn.getToken();
    },

    columnInRange (column) {
      return column >= 0 && column < that.COLUMNS;
    },

    columnCompleted (column) {
      if (that.getLowestAvailableSpace(column) === undefined) {
        return true;
      } else { return false; }
    },

    maxColumns () {
      return that.COLUMNS;
    },

    maxRows () {
      return that.ROWS;
    },

    getBoard () {
      return that.board;
    },

    turn: initTurn()

  };
}

function initBoardView (board) {
  return {
    printBoard () {
      const boardMatrix =  board.getBoard();
      const VERTICAL_SEPARATOR = '|';
      let msg = '---------------\n';
      for (let i = boardMatrix[0].length; i > 0; i--) {
        for (const column of boardMatrix) {
          msg += VERTICAL_SEPARATOR;
          msg += column[i - 1];
        }
        msg += VERTICAL_SEPARATOR + '\n';
      }
      msg += '---------------';
      console.writeln(msg);
    },

    askColumn () {
      let column
      do {
        column = console.readNumber('Enter a column to drop a token:');
        if (!board.columnInRange(column)) { this.printError('Invalid columnn!!! Values [1-7]'); }
        if (board.columnCompleted(column)) { this.printError('Invalid column!!! It\'s completed'); }
      } while (!board.columnInRange(column) || board.columnCompleted(column))
      return column;
    },

    printError (msg) {
      console.writeln(msg);
    },

    turn: initTurnView(board)

  };
}

function initTurn () {
  const that = {
    MAX_PLAYERS: 2,
    tokens: ['R', 'Y'],
    tokensName: ['RED', 'YELLOW'],
    turn: 0
  };

  return {
    getToken () {
      return that.tokens[that.turn];
    },

    getTokenName () {
      return that.tokensName[that.turn];
    },

    next () {
      that.turn = (that.turn + 1) % that.MAX_PLAYERS;
    },

    print () {
      initTurnView().printTurn(this.getTokenName());
    }
  };
}

function initTurnView (board) {
  return {
    printTurn () {
      console.writeln(`TURN: ${board.turn.getTokenName()}`);
    }
  };
}

function initGoal (board) {
  const that = {
    CONNECTIONS_TO_GOAL: 4,
    checkPattern (searchSettings) {
      const { initialColumn, initialRow, columnOffset, rowOffset } = searchSettings;
      const boardMatrix = board.getBoard();
      for (let j = initialColumn; j <= this.maxColumn(searchSettings); j++) {
        for (let i = initialRow; i <=  this.maxRow(searchSettings); i++) {
          const patternValues = [
            boardMatrix[j][i],
            boardMatrix[j + columnOffset * 1][i + rowOffset * 1],
            boardMatrix[j + columnOffset * 2][i + rowOffset * 2],
            boardMatrix[j + columnOffset * 3][i + rowOffset * 3]
          ];
          if (this.isConsecutiveConnection(patternValues)) { return true; }
        }
      }
      return false;
    },

    maxColumn (searchSettings) {
      return board.maxColumns() - 1 - (this.CONNECTIONS_TO_GOAL - 1) * searchSettings.columnOffset;
    },

    maxRow (searchSettings) {
      return board.maxRows() - 1 - (this.CONNECTIONS_TO_GOAL - 1) * (searchSettings.rowOffset < 0 ? 0 : searchSettings.rowOffset);
    },

    isConsecutiveConnection (pattern) {
      let consecutiveConnection = true;
      for (const item of pattern) {
        consecutiveConnection &= item === board.turn.getToken();
      }
      return consecutiveConnection;
    }
  };

  return {
    anyAchived () {
      const horizontal = that.checkPattern({initialColumn: 0, initialRow: 0, columnOffset: 1, rowOffset: 0});
      const vertical = that.checkPattern({initialColumn: 0, initialRow: 0, columnOffset: 0, rowOffset: 1});
      const diagonal = that.checkPattern({initialColumn: 0, initialRow: 0, columnOffset: 1, rowOffset: 1});
      const inverse = that.checkPattern({initialColumn: 0, initialRow: 3, columnOffset: 1, rowOffset: -1});
      return horizontal || vertical || diagonal || inverse;
    }
  };
}
