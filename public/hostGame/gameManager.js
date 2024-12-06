async function startGame(quiz) {
    addBackgroundElements(quiz);
    console.log(quiz.Questions);

    for (const question of quiz.Questions) {
        startQuestion(question);
        await delay(5000);
        sendQuestionToServer();
        displayAnswers(question);
        await waitForResponses();
        clearScreen();
    }
}

function displayAnswers(question) {
    let answersDiv = document.createElement("div");
    question.Answers.forEach((answer) => {
        const answerP = document.createElement("p");
        answerP.innerText = answer;
        answersDiv.appendChild(answerP);
    });
    document.querySelector("body").appendChild(answersDiv);
}

function waitForResponses() {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.onload = () => {
            if (req.status === 200) {
                console.log("All Users Responded");
                resolve(0);
            } else {
                reject("Network error occurred.");
            }
        };

        req.onerror = () => {
            reject("Network error occurred.");
        };

        req.open("POST", "/hostgame/awaitAnswers");
        req.setRequestHeader("Content-Type", "application/json");
        req.send();
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function addBackgroundElements(quiz) {
    const titleDiv = document.createElement("div");
    titleDiv.id = "title_div";

    const quizName = document.createElement("h4");
    const quizAuthor = document.createElement("h4");
    const quizCreated = document.createElement("h4");

    quizName.id = "quiz_name";
    quizAuthor.id = "quiz_author";
    quizCreated.id = "quiz_created";

    quizName.innerText = quiz.Name;
    quizAuthor.innerText = quiz.Author;
    quizCreated.innerText = quiz.Created;

    titleDiv.appendChild(quizName);
    titleDiv.appendChild(quizAuthor);
    titleDiv.appendChild(quizCreated);

    document.querySelector("body").appendChild(titleDiv);
}

function clearScreen() {
    const body = document.querySelector("body");
    for (let i = 0; i < body.children.length; i++) {
        if (
            !(body.children[i].id === "title_div" ||
                body.children[i].id === "header")
        ) {
            body.removeChild(body.children[i]);
            i--;
        }
    }
}

function startQuestion(question) {
    const question_h2 = document.createElement("h2");
    question_h2.classList.add("question_h2");
    question_h2.innerText = question.Question;
    document.querySelector("body").appendChild(question_h2);
}

function sendQuestionToServer(question) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.onload = () => {
            if (req.status === 200) {
                console.log("Server received question!");
                resolve(0);
            } else {
                reject("Network error occurred.");
            }
        };

        req.onerror = () => {
            reject("Network error occurred.");
        };

        req.open("POST", "/hostgame/question");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({ question }));
    });
}
