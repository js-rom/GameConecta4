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
        resume () {

        }
    }

    return {
        play () {

        }
    }
};
