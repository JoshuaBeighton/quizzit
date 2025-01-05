let globalUsername = "";
document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("#join_button");
    button.addEventListener("click", () => {
        alertServer();
        waitForGame();
    });
});

function alertServer() {
    const username = document.querySelector("#input_name").value;
    globalUsername = username;
    if (username.length > 0) {
        const req = new XMLHttpRequest();
        req.open("POST", "/playgame/newclient", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = () => {
            document.querySelector("#join_form").classList.add("hidden");
            document.querySelector("#waiting_text").classList.remove("hidden");
        };
        req.send('{"Name":"' + username + '"}');
    } else {
        document.querySelector("#input_name").classList.add("incorrect");
    }
}

function waitForGame() {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.timeout = 600000;
        req.onload = () => {
            if (req.status === 200) {
                resolve(req.response); // Resolve with the new player's data
            } else if (req.status === 201) {
                resolve();
            } else {
                reject(`Error: ${req.statusText} (${req.status})`);
            }
            startGame();
        };

        req.onerror = () => {
            reject("Network error occurred.");
        };

        req.open("GET", "/playgame/waitForStart");
        req.setRequestHeader("Content-Type", "application/json");
        req.send();
    });
}

function clearScreen() {
    const body = document.querySelector("body");
    while (body.children.length > 1) {
        body.removeChild(body.children[1]);
    }
}

function waitForNextQuestion() {
    clearScreen();
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.timeout = 600000;
        req.onload = () => {
            if (req.status === 200) {
                resolve(req.response); // Resolve with the new player's data
            } else if (req.status === 201) {
                resolve();
            } else {
                reject(`Error: ${req.statusText} (${req.status})`);
            }
        };

        req.onerror = () => {
            reject("Network error occurred.");
        };

        req.open("GET", "/playgame/nextQuestion");
        req.setRequestHeader("Content-Type", "application/json");
        req.send();
    });
}

function showQuestion(question) {
    const questionText = document.createElement("h3");
    questionText.id = "question";
    questionText.innerText = question.question.Question;
    const answersDiv = document.createElement("div");
    for (index in question.question.Answers) {
        element = document.createElement("button");
        element.innerText = question.question.Answers[index];
        element.addEventListener("click", answerButtonHandler);
        answersDiv.appendChild(element);
    }
    document.querySelector("body").appendChild(questionText);
    document.querySelector("body").appendChild(answersDiv);
}

function sendAnswer(answer) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.timeout = 600000;
        req.onload = () => {
            if (req.status === 200) {
                resolve(req.response); // Resolve with the new player's data
            } else if (req.status === 201) {
                resolve();
            } else {
                reject(`Error: ${req.statusText} (${req.status})`);
            }
        };

        req.onerror = () => {
            reject("Network error occurred.");
        };

        req.open("POST", "/playgame/answer");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(answer));
    });
}

function answerButtonHandler() {
    const question = document.querySelector("#question").innerText;
    const answer = this.innerText;
    const ans = {
        "Question": question,
        "Answer": answer,
        "Player": globalUsername,
    };
    sendAnswer(ans).then(startGame);
}

function startGame() {
    waitForNextQuestion().then((response) => {
        showQuestion(JSON.parse(response));
    });
}
