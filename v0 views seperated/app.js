const { Console } = require("./console");
const console = new Console();

connectFour().play();

function connectFour () {
    return {
        play () {
            const yesNoDialog = initYesNoDialog('Would you like to play again?');
            do {
                initGame().play();
                retryDialog.askToPlayAgain();
            } while (yesNoDialog.isAffirmative())

        }
    }
}
function initYesNoDialog (question) {
    let that = {
        question: question,
        answer: ``,
        saveAnswer: function (answer) {
            this.answer = answer;
        }
    };

    return {
        isAffirmative: function () {
            return that.answer === `y`;
        },

        isNegative: function () {
            return that.answer === `n`;
        },

        askToPlayAgain: function () {
            let error = false;
            do {
                let answer = console.readString(that.question)
                that.saveAnswer(answer);
                error = !this.isAffirmative() && !this.isNegative();
                if (error) {
                    console.writeln(`Please, answer "y" or "n"`);
                }
            } while (error);
        }
    };
};

function initGame () {
    let that = {
        resume (board, turn) {
            return !board.isCompleted() && !initGoal(turn).anyAchived(board)
        }
    }

    return {
        play () {
            initGameView().printTitle();
            const board = initBoard();
            board.printBoard();
            const turn = initTurn();
            do {
                turn.next();
                turn.print();
                board.dropToken(turn.getToken())
                board.printBoard();
            } while (that.resume(board, turn))
            initGoal().anyAchived(board, turn) ? initGameView().printWinnerMsg() : initGameView().printTieMsg();
        }
    }
};

function initBoard () {
    let that = {
        COLUMNS: 7,
        ROWS: 6,
        TOKEN_EMPTY: '',
        board: [
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY],
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY],
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY],
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY],
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY],
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY],
            [ TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY, TOKEN_EMPTY]
        ],
        columnInRange (column) {
            return 0 <= column && column < this.COLUMNS
        },

        columnCompleted (column) {
            if  (getLowestAvailableSpace(column) === undefined) {
                return true
            } else {return false}
        },

        getLowestAvailableSpace (column) {
            for (let i = 0; i < this.ROWS; i++) {
                if (this.board[column][i]===this.TOKEN_EMPTY) {return i}
            }
        },

        addTokenToBoard (token, column) {
            this.board[column][this.getLowestAvailableSpace(column)] = token;
        }, 
        
    }

    return {
        isCompleted () {
            let completed = true;
            for (let i = 0; i < that.COLUMNS; i++) {
                completed &= that.columnCompleted(i)
            }
        },

        dropToken (token) {
            let column;
            do {
                column = initBoardView().askColumn() - 1
                if (!that.columnInRange(column)) {initBoardView().printError(`Invalid columnn!!! Values [1-7]`)}
                if (that.columnCompleted(column)) {initBoardView().printError(`Invalid column!!! It's completed`)}
            } while (!that.columnInRange(column) || that.columnCompleted(column));
            that.addTokenToBoard(token, column);
            
        },

        printBoard () {
            initBoardView().printBoard(that.board)
        }

    }
};

function initBoardView () {

    return {
        printBoard (board) {
            const HORIZONTAL_SEPARATOR = `-` //15
            const VERTICAL_SEPARATOR = `|` //8
            let msg = `---------------------\n` 
            for (let i = board[0].length ; i > 0 ; i--) {
                for ( column of board) {
                    msg += VERTICAL_SEPARATOR;
                    msg += column[i-1];
                    msg += VERTICAL_SEPARATOR;
                }
                msg += VERTICAL_SEPARATOR + '\n'
            }
            msg += `---------------------`
            console.writeln(msg)
        },

        askColumn () {
            return console.readNumber('Enter a column to drop a token:')
        },
 
        printError (msg) {
            console.writeln(msg)
        }

    }
};

function initTurn () {
    let that = {
        MAX_PLAYERS: 2,
        tokens: ['R', 'Y'],
        tokensName: ['RED', 'YELLOW'],
        turn: 0
    };

    return {
        getToken () {
            return that.tokens[that.turn]
        },

        getTokenName () {
            return that.tokensName[that.turn]
        },

        next () {
            that.turn = (that.turn + 1) % that.MAX_PLAYERS;
        },

        print () {
            initTurnView().printTurn(this.getTokenName())
        }
    }
};

function initTurnView () {
    return {
        printTurn (turn) {
            console.writeln(`TURN: ${turn}`)
        }
    }
};

function initGoal (turn) {
    //  declarar patrones que al cambiar la coordenada inicial sse vaya moviendo y campatando la info
    let horizontal_pattern = [[i,j],[i,j+1],[i,j+2],[i,j+3]]
    let vertical_pattern = [[i,j],[i+1,j],[i+2,j],[i+3,j]]
    let diagonal_pattern = [[i,j],[i+1,j+1],[i+2,j+2],[i+3,j+3]]
    let inverse_pattern = [[i,j],[i-1,j-1],[i-2,j-2],[i-3,j-3]]

    let that = {
        CONNECTIONS_TO_GOAL: 4,
        horizontal ({board, ROWS}) {
            for (let i = 0; i < ROWS; i++) {
                let consecutiveConnections = 0
                for (column of board) {
                    if (column[i] !== turn.getToken()) {consecutiveConnections = 0}
                    if (column[i] === turn.getToken()) {consecutiveConnections ++}
                    if (consecutiveConnections === this.CONNECTIONS_TO_GOAL) {return true}
                }
            }
            return false
        },

        vertical ({board, ROWS}) {
            for (let column of board){
                let consecutiveConnections = 0
                for (let i = 0; i < ROWS; i++){
                    if (column[i] !== turn.getToken()) {consecutiveConnections = 0}
                    if (column[i] === turn.getToken()) {consecutiveConnections ++}
                    if (consecutiveConnections === this.CONNECTIONS_TO_GOAL) {return true}
                }
            return false
            }
        },

        diagonal ({board, ROWS, COLUMNS}) {
            const MAX_COLUMN_TO_CHECK = COLUMNS - this.CONNECTIONS_TO_GOAL
            const MAX_ROW_TO_CHECK = ROWS - this.CONNECTIONS_TO_GOAL
            for (let i = 0; i <= MAX_COLUMN_TO_CHECK; i++) {
                let consecutiveConnections = 0
                for (let i = 0; i <= MAX_ROW_TO_CHECK; i++) {

                }
            }
        },

        inverse ({board, ROWS}) {

        }
    };
    

    return {
        anyAchived (board) {
            return that.horizontal(board) || that.vertical(board) || that.diagonal(board) || that.inverse(board)
        }
    }
};

