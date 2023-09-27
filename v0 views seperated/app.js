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
    resume (board, turn) {
        console.writeln('resume-goal: ' + initGoal(turn).anyAchived(board))
      return !board.isCompleted() && !initGoal(turn).anyAchived(board);
    }
  };

  return {
    play () {
      initGameView().printTitle();
      const board = initBoard();
      board.printBoard();
      const turn = initTurn();
      do {
        turn.next();
        turn.print();
        board.dropToken(turn.getToken());
        board.printBoard();
      } while (that.resume(board, turn));
      initGoal(turn).anyAchived(board) ? initGameView().printWinnerMsg(turn.getToken()) : initGameView().printTieMsg();
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
    }

  };
}

function initBoardView () {
  return {
    printBoard (board) {
      // const HORIZONTAL_SEPARATOR = '-'; // 15
      const VERTICAL_SEPARATOR = '|'; // 8
      let msg = '---------------\n';
      for (let i = board[0].length; i > 0; i--) {
        for (const column of board) {
          //console.writeln(column)
          msg += VERTICAL_SEPARATOR;
          msg += column[i - 1];
          //msg += VERTICAL_SEPARATOR;
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

function initGoal (turn) {
  const that = {
    CONNECTIONS_TO_GOAL: 4,
    /*horizontal ({ board, ROWS, COLUMNS }) {
      const searchSettings = {
        initialColumn: 0,
        initialRow: 0,
        maxColumn: COLUMNS - that.CONNECTIONS_TO_GOAL,
        maxRow: ROWS,
        pattern: [[this.initialColumn, this.initialRow], [this.initialColumn + 1, this.initialRow], [this.initialColumn + 2, this.initialRow], [this.initialColumn + 3, this.initialRow]]
      };
      return this.checkPattern(searchSettings, board);
    },*/

    vertical (board) {
      let searchSettings = {
        initialColumn: 0,
        initialRow: 0,
        maxColumn: board.maxColumns(),
        maxRow: board.maxRows() - that.CONNECTIONS_TO_GOAL,
        // pattern: [[this.initialColumn, this.initialRow], [this.initialColumn, this.initialRow + 1], [this.initialColumn, this.initialRow + 2], [this.initialColumn, this.initialRow + 3]]
      };
      searchSettings.pattern = [[searchSettings.initialColumn, searchSettings.initialRow], [searchSettings.initialColumn, searchSettings.initialRow + 1], [searchSettings.initialColumn, searchSettings.initialRow + 2], [searchSettings.initialColumn, searchSettings.initialRow + 3]]
      console.writeln('vertical called')
      return this.checkPattern(searchSettings, board);
    },

    /*diagonal ({ board, ROWS, COLUMNS }) {
      const searchSettings = {
        initialColumn: 0,
        initialRow: 0,
        maxColumn: COLUMNS - that.CONNECTIONS_TO_GOAL,
        maxRow: ROWS - that.CONNECTIONS_TO_GOAL,
        pattern: [[this.initialColumn, this.initialRow], [this.initialColumn + 1, this.initialRow + 1], [this.initialColumn + 2, this.initialRow + 2], [this.initialColumn + 3, this.initialRow + 3]]
      };
      return this.checkPattern(searchSettings, board);
    },

    inverse ({ board, ROWS, COLUMNS }) {
      const searchSettings = {
        initialColumn: 0,
        initialRow: that.CONNECTIONS_TO_GOAL - 1,
        maxColumn: COLUMNS - that.CONNECTIONS_TO_GOAL,
        maxRow: ROWS,
        pattern: [[this.initialColumn, this.initialRow], [this.initialColumn + 1, this.initialRow - 1], [this.initialColumn + 2, this.initialRow - 2], [this.initialColumn + 3, this.initialRow - 3]]
      };
      return this.checkPattern(searchSettings, board);
    },*/

    checkPattern (searchSettings, board) {
        console.writeln('checkPattern called')
      const { initialColumn, initialRow, maxColumn, maxRow, pattern } = searchSettings;
      console.writeln('initialColumn ' + initialColumn)
      console.writeln('initialRow ' + initialRow)
      console.writeln('maxColumn ' + maxColumn)
      console.writeln('maxRow ' + maxRow)
      console.writeln('pattern ' + pattern)
      const boardMatrix = board.getBoard();
      for (let j = initialColumn; j < maxColumn; j++) {
        for (let i = initialRow; i < maxRow; i++) {
          const patternValues = [
            boardMatrix[pattern[0][0]][pattern[0][1]],
            boardMatrix[pattern[1][0]][pattern[1][1]],
            boardMatrix[pattern[2][0]][pattern[2][1]],
            boardMatrix[pattern[3][0]][pattern[3][1]]
          ];
          console.writeln('patternValue: ' + patternValues)
          if (this.isConsecutiveConnection(patternValues)) { return true; }
        }
      }
      return false;
    },

    isConsecutiveConnection (pattern) {
      let consecutiveConnection = true;
      console.writeln('isConsecutiveConnection() ');
      for (const item of pattern) {
        console.writeln('item: ' + item);
        console.writeln('token: ' + turn.getToken());
        console.writeln('igualdad: ' + item === turn.getToken());
        consecutiveConnection &= item === turn.getToken();
      }
      return consecutiveConnection;
    }
  };

  return {
    anyAchived (board) {
        //console.writeln(that.horizontal(board));
        console.writeln(that.vertical(board));
        //console.writeln(that.diagonal(board));
        //console.writeln(that.inverse(board));
     // return that.horizontal(board) || that.vertical(board) || that.diagonal(board) || that.inverse(board);
     return that.vertical(board)
    }
  };
}
