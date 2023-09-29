const { Console } = require('./console');
const console = new Console();

connectFour().play();

function connectFour () {
  return {
    play () {
      const yesNoDialog = initYesNoDialog('Would you like to play again?');
      do {
        initGame().play();
        yesNoDialog.askToPlayAgain();
      } while (yesNoDialog.isAffirmative());
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

function initGame () {
  const that = {
    resume (board) {
      return !board.isCompleted() && !initGoal(board).anyAchived();
    }
  };

  return {
    play () {
      initGameView().printTitle();
      const board = initBoard();
      board.printBoard();
      //const turn = initTurn();
      do {
        board.turn.next();
        board.turn.print();
        board.dropToken(board.turn.getToken());
        board.printBoard();
      } while (that.resume(board));
      initGoal(board).anyAchived() ? initGameView().printWinnerMsg(board.turn.getTokenName()) : initGameView().printTieMsg();
    }
  };
}

function initGameView () {
  return {
    printTitle () {
      console.writeln('--- CONNECT 4 ---');
    },

    printWinnerMsg (msg) {
      console.writeln(`${msg} WIN!!! :-)`);
    },

    printTieMsg () {
      console.writeln('TIED!!!');
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
    columnInRange (column) {
      return column >= 0 && column < this.COLUMNS;
    },

    columnCompleted (column) {
      if (this.getLowestAvailableSpace(column) === undefined) {
        return true;
      } else { return false; }
    },

    getLowestAvailableSpace (column) {
      for (let i = 0; i < this.ROWS; i++) {
        if (this.board[column][i] === this.TOKEN_EMPTY) { return i; }
      }
    },

    addTokenToBoard (token, column) {
      this.board[column][this.getLowestAvailableSpace(column)] = token;
    }

  };

  return {
    isCompleted () {
      let completed = true;
      for (let i = 0; i < that.COLUMNS; i++) {
        completed &= that.columnCompleted(i);
      }
      return completed;
    },

    dropToken (token) {
      let column;
      do {
        column = initBoardView().askColumn() - 1;
        if (!that.columnInRange(column)) { initBoardView().printError('Invalid columnn!!! Values [1-7]'); }
        if (that.columnCompleted(column)) { initBoardView().printError('Invalid column!!! It\'s completed'); }
      } while (!that.columnInRange(column) || that.columnCompleted(column));
      that.addTokenToBoard(token, column);
    },

    printBoard () {
      initBoardView().printBoard(that.board);
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

function initBoardView () {
  return {
    printBoard (board) {

      const VERTICAL_SEPARATOR = '|';
      let msg = '---------------\n';
      for (let i = board[0].length; i > 0; i--) {
        for (const column of board) {
          msg += VERTICAL_SEPARATOR;
          msg += column[i - 1];
        }
        msg += VERTICAL_SEPARATOR + '\n';
      }
      msg += '---------------';
      console.writeln(msg);
    },

    askColumn () {
      return console.readNumber('Enter a column to drop a token:');
    },

    printError (msg) {
      console.writeln(msg);
    }

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

function initTurnView () {
  return {
    printTurn (turn) {
      console.writeln(`TURN: ${turn}`);
    }
  };
}

function initGoal (board) {
  const that = {
    CONNECTIONS_TO_GOAL: 4,

    horizontal () {
      return this.checkPattern({initialColumn: 0, initialRow: 0, columnOffset: 1, rowOffset: 0});
    },

    vertical () {
      return this.checkPattern({initialColumn: 0, initialRow: 0, columnOffset: 0, rowOffset: 1});
    },

    diagonal () {
      return this.checkPattern({initialColumn: 0, initialRow: 0, columnOffset: 1, rowOffset: 1});
    },

    inverse () {
      return this.checkPattern({initialColumn: 0, initialRow: 3, columnOffset: 1, rowOffset: -1});
    },

    checkPattern (searchSettings) {
      const { initialColumn, initialRow, columnOffset, rowOffset } = searchSettings;
      const MAX_COLUMN = board.maxColumns() - 1 - (this.CONNECTIONS_TO_GOAL - 1) * columnOffset
      const MAX_ROW = board.maxRows() - 1 - (this.CONNECTIONS_TO_GOAL - 1) * (rowOffset < 0 ? 0 : rowOffset)
      const boardMatrix = board.getBoard();
      for (let j = initialColumn; j <= MAX_COLUMN; j++) {
        for (let i = initialRow; i <= MAX_ROW; i++) {
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
      return that.horizontal() || that.vertical() || that.diagonal() || that.inverse();
    }
  };
}
