const { Console } = require('./console');
const console = new Console();

initConnectFour().start();

function initConnectFour() {
    return {
        start() {
            const yesNoDialog = initYesNoDialog('Would you like to play again?');
            do {
                const gameView = initGameView();
                gameView.printTitle();
                gameView.play();
                gameView.printRoundResult();
                yesNoDialog.askToPlayAgain()
            } while (yesNoDialog.isAffirmative())
        }
    }
}

function initYesNoDialog(question) {
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

function initGameView() {
    let that = {
        boardView: initBoardView(initBoard())
    }

    return {
        printTitle() {
            console.writeln('--- CONNECT 4 ---');
        },

        printWinnerMsg() {
            let msg = that.boardView.turnView.getTokenName()
            console.writeln(`${msg} WIN!!! :-)`);
        },

        printTieMsg() {
            console.writeln('TIED!!!');
        },

        printRoundResult() {
            that.boardView.anyGoalAchived() ? this.printWinnerMsg() : this.printTieMsg();
        },

        play() {
            that.boardView.printBoard();
            do {
                that.boardView.turnView.next();
                that.boardView.turnView.printTurn()
                let column = that.boardView.askValidColumn();
                that.boardView.addToken(column);
                that.boardView.printBoard();
            } while (this.resume());
        },

        resume() {
            return !that.boardView.boardCompleted() && !that.boardView.anyGoalAchived();
        }
    }
}

function initBoardView(board) {
    let that = {
        EMPTY_TOKEN: ' ',
        board: board,
        turnView: initTurnView(board),

        askValidColumnNumber() {
            let column
            do {
                column = console.readNumber('Enter a column to drop a token:') - 1;
                if (!board.columnInRange(column)) {
                    this.printError('Invalid columnn!!! Values [1-7]');
                }
            } while (!board.columnInRange(column))
            return column
        },

        columnCompleted(column) {
            return board.columnCompleted(column)
        },

        printError(msg) {
            console.writeln(msg);
        },
    }

    return {
        anyGoalAchived() {
            return board.anyGoalAchived()
        },

        printBoard() {
            const VERTICAL_SEPARATOR = '|';
            const EMPTY_TOKEN = ` `
            let msg = '---------------\n';
            for (let i = that.board.MAX_ROWS; i >= 0; i--) {
                for (let j = 0; j <= that.board.MAX_COLUMNS; j++) {
                    let token = that.board.board.find(token => token.row === i && token.column === j)
                    msg += VERTICAL_SEPARATOR;
                    msg += token === undefined ? EMPTY_TOKEN : token.tokenSymbol
                }
                msg += VERTICAL_SEPARATOR + '\n';
            }
            msg += '---------------';
            console.writeln(msg);
        },

        askValidColumn() {
            let column
            do {
                column = that.askValidColumnNumber()
                if (that.columnCompleted(column)) {
                    that.printError(`Invalid column!!! It's completed`)
                }
            } while (that.columnCompleted(column))
            return column
        },

        addToken(column) {
            board.addToken(column)
        },

        boardCompleted() {
            return board.isCompleted()
        },

        turnView: that.turnView
    }
}

function initTurnView(board) {
    return {
        printTurn() {
            console.writeln(`TURN: ${board.turn.getTokenName()}`);
        },

        getToken() {
            return board.turn.getToken()
        },

        getTokenName() {
            return board.turn.getTokenName()
        },

        next() {
            board.turn.next()
        }
    }
}

function initBoard() {
    let that = {
        MAX_COLUMNS: 6,
        MAX_ROWS: 5,
        turn: initTurn(),
        board: []
    }

    return {
        isCompleted() {
            return that.board.length === (that.MAX_COLUMNS + 1) * (that.MAX_ROWS + 1);
        },

        columnCompleted(column) {
            return that.board.filter(token => token.column === column).length > that.MAX_ROWS;
        },

        columnInRange(column) {
            return column >= 0 && column <= that.MAX_COLUMNS;
        },

        addToken(column) {
            let row = that.board.filter(token => token.column === column).length;
            let coordenate = { row: row, column: column }
            const token = initToken(coordenate, that.turn.getToken(), that.board);
            that.board.push(token);
        },

        anyGoalAchived() {
            const LAST_TOKEN = that.board.findLast(token => true);
            return LAST_TOKEN.isGoal();
        },

        turn: that.turn,
        MAX_COLUMNS: that.MAX_COLUMNS,
        MAX_ROWS: that.MAX_ROWS,
        board: that.board
    }
}

function initToken(coordenate, token, parent) {
    let that = {
        direction: initDirection(),
        CONNECTIONS_TO_GOAL: 4,
    }

    return {
        row: coordenate.row,
        column: coordenate.column,
        tokenSymbol: token,
        parent: parent,
        isGoal() {
            for (let setGoal of this.goalSetters()) {
                setGoal();
                if (this.countConsecutive() === that.CONNECTIONS_TO_GOAL) { return true; }
            }
            return false;
        },

        goalSetters() {
            return [that.direction.setVertical, that.direction.setHorizontal, that.direction.setDiagonal, that.direction.setInverse];
        },

        countConsecutive() {
            let consecutiveTokens = 1;
            const myself = this.parent.findLast(token => true)
            let temp = myself;
            for (let i = 0; i < that.CONNECTIONS_TO_GOAL; i++) {
                let neighbour = this.getNeighbour(temp)
                if (neighbour !== undefined) {
                    consecutiveTokens++;
                    temp = neighbour;
                } else {
                    that.direction.switchOffSet();
                    temp = myself;
                }
            }
            return consecutiveTokens;
        },

        getNeighbour(mySelf) {
            const offset = that.direction.getOffset();
            const NEIGHBOUR = this.parent.find(token => {
                return token.row === mySelf.row + offset.rowOffset &&
                    token.column === mySelf.column + offset.columnOffset &&
                    token.tokenSymbol === this.tokenSymbol
            });
            return NEIGHBOUR;
        }
    }
}

function initDirection() {
    let that = {
        rowOffset: undefined,
        columnOffset: undefined,
    }

    return {
        switchOffSet() {
            that.rowOffset *= -1;
            that.columnOffset *= -1
        },

        setVertical() {
            that.rowOffset = 1;
            that.columnOffset = 0;
        },

        setHorizontal() {
            that.rowOffset = 0;
            that.columnOffset = 1;
        },

        setDiagonal() {
            that.rowOffset = 1;
            that.columnOffset = 1;
        },
        setInverse() {
            that.rowOffset = 1;
            that.columnOffset = -1;
        },

        getOffset() {
            return { rowOffset: that.rowOffset, columnOffset: that.columnOffset }
        },
    }
}

function initTurn() {
    const that = {
        MAX_PLAYERS: 2,
        tokens: ['R', 'Y'],
        tokensName: ['RED', 'YELLOW'],
        turn: 0
    };

    return {
        getToken() {
            return that.tokens[that.turn];
        },

        getTokenName() {
            return that.tokensName[that.turn];
        },

        next() {
            that.turn = (that.turn + 1) % that.MAX_PLAYERS;
        },
    };
}
