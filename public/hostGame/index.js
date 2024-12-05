let _quiz;
let players = 0;
let gameStarted = false;
let playerJoined = true;

document.addEventListener("DOMContentLoaded", ()=>{
    addOnFileLoadedListener();
});

function addOnFileLoadedListener(){
    const input = document.querySelector("#game_input");
    input.addEventListener("change",loadQuestions, false);
}

function loadQuestions(){
    this.classList.add("hidden");
    const file = this.files[0];
    const reader = new FileReader();
    let tempQuiz;
    reader.addEventListener('load', (event) => {
        tempQuiz = JSON.parse(event.target.result);
        _quiz = tempQuiz;
        createHTMLForQuiz(tempQuiz);
    });
    reader.readAsText(file);
}

function createHTMLForQuiz(quiz){
    const quizDiv = document.createElement("div");
    const quizTitle = document.createElement("h3");
    const quizCreated = document.createElement("h4");
    const quizQuestions = document.createElement("div");
    const goButton = document.createElement("button");

    quizTitle.innerText = quiz.Name;
    quizCreated.innerText = quiz.Created;

    quiz.Questions.forEach(question => {
        const questionDiv = document.createElement("div");
        const answersDiv = document.createElement("div");
        const questionText = document.createElement("p");

        questionText.innerText = question.Question;

        goButton.addEventListener("click", enterPreGame,false);
        goButton.innerText = "GO"

        question.Answers.forEach(answer =>{
            const answerText = document.createElement("p");
            answerText.innerText = answer;
            answerText.classList.add("answer");
            if (answer === question.Correct){
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

async function enterPreGame(){
    clearScreen();
    const body = document.querySelector("body");
    
    const clientsDiv = document.createElement("div");
    clientsDiv.classList.add("clients_div");

    body.appendChild(clientsDiv);
    console.log("Waiting For Next Player");
    await waitForNewPlayers();
}

function addPlayer(name){
    const text = document.createElement("p");
    text.innerText = name;

    document.querySelector(".clients_div").appendChild(text);
}

async function waitForNewPlayers() {
    while (!gameStarted) {
        try {
            const newPlayer = await waitForNextPlayer();
            addPlayer(newPlayer);
            console.log("New player joined:", newPlayer);
        } catch (error) {
            console.error("Error waiting for next player:", error);
            break; // Exit if there's an error, or handle retry logic
        }
    }
    if (gameStarted) {
        console.log("Game started. Stopping player wait.");
    }
}

function clearScreen(){
    const body = document.querySelector("body");
    while (body.children.length > 1){
        body.removeChild(body.children[1]);
    }
}

function waitForNextPlayer() {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();

        req.onload = () => {
            if (req.status === 200) {
                players++;
                resolve(req.response); // Resolve with the new player's data
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