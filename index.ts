import express, { Request, Response } from "npm:express";

const app = express();

// Middleware for JSON parsing.
app.use(express.json());
// Middleware to serve static files.
app.use(express.static("public"));

// Store the players currently in the game.
const currentPlayers: string[] = [];

// Store the responses of players to each question.
const allResponses: Map<string, Map<string, string>> = new Map<
    string,
    Map<string, string>
>();
const currentResponses: Map<string, string> = new Map<string, string>();

// Store whether the game has started.
let gameStarted = false;
// Store the current question number.
let questionNo = 0;
// Store the current question.
let currentQuestion: string;

/**
 * Deal with host requesting new client.
 */
app.post("/hostgame/clientwaiting", async (req: Request, res: Response) => {
    try {
        // Wait for a new player to join the game, storing their name once they do.
        const nextPlayer = await waitForNewPlayers(req.body.players);
        // Send the player's name to the host.
        res.send(nextPlayer);
    } // If game is started before this request is fulfilled, send a 201 in response.
    catch (_error) {
        res.status(201);
        res.send("Game Started");
    }
});

/**
 * Handle a host request to start the game.
 */
app.post("/hostgame/startgame", (_req: Request, res: Response) => {
    // Send an acknowledgement.
    res.send("ack");
    // Store that the game has started.
    gameStarted = true;
});

/**
 * Wait for new players to join.
 * @param players The amount of players at the beginning of waiting.
 * @returns The name of the newest player.
 */
function waitForNewPlayers(players: number) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            // If the game has started, clear the interval and reject the promise.
            if (gameStarted) {
                clearInterval(interval);
                reject("GAME STARTED");
            }

            // If a new player has joined, clear the interval and resolve the promise, returning the last element in the player list.
            if (players != currentPlayers.length) {
                clearInterval(interval);
                resolve(currentPlayers[currentPlayers.length - 1]);
            }
        }, 100); // Check every 100ms
    });
}

/**
 * Wait for the game to start.
 * @returns "GAME STARTED"
 */
function waitForGameStarting() {
    return new Promise((resolve, _reject) => {
        const interval = setInterval(() => {
            // If the game has started, clear the interval and resolve the promise.
            if (gameStarted) {
                clearInterval(interval);
                resolve("GAME STARTED");
            }
        }, 100); // Check every 100ms
    });
}

function waitForNextQuestion(oldQuestion: string) {
    return new Promise((resolve, _reject) => {
        const interval = setInterval(() => {
            // If a new player has joined, clear the interval and resolve the promise, returning the last element in the player list.
            if (oldQuestion != currentQuestion) {
                clearInterval(interval);
                resolve(currentQuestion);
            }
        }, 100); // Check every 100ms
    });
}

function waitForAnswers() {
    return new Promise((resolve, _reject) => {
        const interval = setInterval(() => {
            // If a new player has joined, clear the interval and resolve the promise, returning the last element in the player list.
            if (currentResponses.size == currentPlayers.length) {
                clearInterval(interval);
                allResponses.set(currentQuestion, currentResponses);
                resolve(currentQuestion);
            }
        }, 100); // Check every 100ms
    });
}

/**
 * Handle get request to determine start of game.
 */
app.get("/playgame/waitForStart", async (_req: Request, res: Response) => {
    try {
        // Wait for game to start.
        await waitForGameStarting();
        // Respond to request.
        res.send("GAME STARTED");
    } // Response with error if necessary.
    catch (_error) {
        res.status(501);
        res.send("Error");
    }
});

/**
 * Handle new clients joining.
 */
app.post("/playgame/newclient", function (req: Request, res: Response) {
    // Add the players name to the array, and respond with the list of current players.
    currentPlayers.push(req.body.Name);
    res.send(currentPlayers);
});

/**
 * Handle a new incoming question.
 */
app.post("/hostgame/question", function (req: Request, res: Response) {
    // Store the current question.
    currentQuestion = req.body;
    // Empty the map of answers.
    currentResponses.clear();
    // Increment the question number.
    questionNo++;
    // Respond to request.
    res.send("Ack");
});

/**
 * Respond to the host waiting for answers.
 */
app.post(
    "/hostgame/awaitAnswers",
    async function (_req: Request, res: Response) {
        console.log("Waiting for responses");
        await waitForAnswers();
        res.send("Boo");
    },
);

app.get("/playgame/nextQuestion", async (_req: Request, res: Response) => {
    await waitForNextQuestion(currentQuestion);
    res.send(currentQuestion);
});

app.post("/playgame/answer", (req: Request, res: Response) => {
    const player = req.body.Player;
    const answer = req.body.Answer;
    currentResponses.set(player, answer);
    res.send("Ack");
});

// Listen on port 8000.
app.listen(8000);
