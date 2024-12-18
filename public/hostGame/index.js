let quiz;
let players = 0;
let gameStarted = false;

document.addEventListener("DOMContentLoaded", () => {
    addOnFileLoadedListener();
});

function addOnFileLoadedListener() {
    const input = document.querySelector("#game_input");
    input.addEventListener("change", loadQuestions, false);
}

function loadQuestions() {
    this.classList.add("hidden");
    const file = this.files[0];
    const reader = new FileReader();
    let tempQuiz;
    reader.addEventListener("load", (event) => {
        tempQuiz = JSON.parse(event.target.result);
        quiz = tempQuiz;
        createHTMLForQuiz(tempQuiz);
    });
    reader.readAsText(file);
}

function createHTMLForQuiz(quiz) {
    const quizDiv = document.createElement("div");
    const quizTitle = document.createElement("h3");
    const quizCreated = document.createElement("h4");
    const quizQuestions = document.createElement("div");
    const goButton = document.createElement("button");

    quizTitle.innerText = quiz.Name;
    quizCreated.innerText = quiz.Created;

    quiz.Questions.forEach((question) => {
        const questionDiv = document.createElement("div");
        const answersDiv = document.createElement("div");
        const questionText = document.createElement("p");

        questionText.innerText = question.Question;

        goButton.addEventListener("click", enterPreGame, false);
        goButton.innerText = "GO";

        question.Answers.forEach((answer) => {
            const answerText = document.createElement("p");
            answerText.innerText = answer;
            answerText.classList.add("answer");
            if (answer === question.Correct) {
                answerText.classList.add("correct");
            }
            answersDiv.appendChild(answerText);
        });

        questionDiv.classList.add("question_div");
        answersDiv.classList.add("answer_div");

        questionDiv.appendChild(questionText);
        questionDiv.appendChild(answersDiv);
        quizQuestions.appendChild(questionDiv);
    });
    quizQuestions.classList.add("quiz_questions");
    quizDiv.classList.add("quiz_div");
    quizDiv.appendChild(quizTitle);
    quizDiv.appendChild(quizCreated);
    quizDiv.appendChild(quizQuestions);
    quizDiv.appendChild(goButton);
    document.querySelector("body").appendChild(quizDiv);
}

async function enterPreGame() {
    clearScreen();
    const body = document.querySelector("body");

    const clientsDiv = document.createElement("div");
    clientsDiv.classList.add("clients_div");

    const startGameButton = document.createElement("button");
    startGameButton.innerText = "Start Game";
    startGameButton.id = "start_game_button";

    startGameButton.addEventListener("click", () => {
        alertServerStartGame().then(() => {
            const body = document.querySelector("body");
            while (body.children.length > 1) {
                body.removeChild(body.children[1]);
            }
            startGame(quiz);
        });
    });

    body.appendChild(clientsDiv);
    body.appendChild(startGameButton);
    console.log("Waiting For Next Player");
    await waitForNewPlayers();
}

function alertServerStartGame() {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.onload = () => {
            if (req.status === 200) {
                console.log("Game Started!");
                resolve(0);
            } else {
                reject("Network error occurred.");
            }
            gameStarted = true;
        };

        req.onerror = () => {
            reject("Network error occurred.");
        };

        req.open("POST", "/hostgame/startgame");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({ players }));
    });
}

function addPlayer(name) {
    const text = document.createElement("p");
    text.innerText = name;
    try {
        document.querySelector(".clients_div").appendChild(text);
    } catch (_error) {
        console.log("Couldn't add client");
    }
}

async function waitForNewPlayers() {
    while (!gameStarted) {
        try {
            const newPlayer = await waitForNextPlayer();
            if (newPlayer != "") {
                addPlayer(newPlayer);
                console.log("New player joined:", newPlayer);
            }
        } catch (error) {
            console.error("Error waiting for next player:", error);
            break; // Exit if there's an error, or handle retry logic
        }
    }
    if (gameStarted) {
        console.log("Game started. Stopping player wait.");
    }
}

function clearScreen() {
    const body = document.querySelector("body");
    while (body.children.length > 1) {
        body.removeChild(body.children[1]);
    }
}

function waitForNextPlayer() {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.timeout = 300000;
        req.onload = () => {
            if (req.status === 200) {
                players++;
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

        req.open("POST", "/hostgame/clientwaiting");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({ players }));
    });
}
