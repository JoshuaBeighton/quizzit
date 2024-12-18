document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("#join_button");
    button.addEventListener("click", () => {
        alertServer();
        waitForGame();
    });
});

function alertServer() {
    const username = document.querySelector("#input_name").value;
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

        req.open("POST", "/playgame/waitForStart");
        req.setRequestHeader("Content-Type", "application/json");
        req.send();
    });
}

function startGame() {
    alert("Game Started!");
}
