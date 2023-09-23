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
            return !board.isCompleted() && !initGoal().anyAchived(board, turn)
        }
    }

    return {
        play () {
            initGameView().printTitle();
            const board = initBoard();
            board.printBoard();
            const turn = initTurn();
            do {
                turn.next()
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
            } while (!that.columnInRange(column) || that.columnCompleted(column));
            that.addTokenToBoard(token, column);
            
        },

        printBoard () {
            initBoardView().printBoard(board)
        }

    }
}