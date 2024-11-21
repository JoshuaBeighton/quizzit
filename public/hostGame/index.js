document.addEventListener("DOMContentLoaded", ()=>{
    addOnFileLoadedListener();
});

function addOnFileLoadedListener(){
    const input = document.querySelector("#game_input");
    input.addEventListener("change",loadQuestions, false);
}

function loadQuestions(){
    const file = this.files[0];
    const reader = new FileReader();
    let quiz;
    reader.addEventListener('load', (event) => {
        quiz = JSON.parse(event.target.result);
        console.log(quiz);
        createHTMLForQuiz(quiz);
    });
    reader.readAsText(file);
}

function createHTMLForQuiz(quiz){
    let quizDiv = document.createElement("div");
    let quizTitle = document.createElement("h3");
    let quizCreated = document.createElement("h4");
    let quizQuestions = document.createElement("div");

    quizTitle.innerText = quiz.Name;
    quizCreated.innerText = quiz.Created;

    quiz.Questions.forEach(question => {
        let questionDiv = document.createElement("div");
        let answersDiv = document.createElement("div");
        let questionText = document.createElement("p");
        
        questionText.innerText = question.Question;

        question.Answers.forEach(answer =>{
            let answerText = document.createElement("p");
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
    document.querySelector("body").appendChild(quizDiv);

}