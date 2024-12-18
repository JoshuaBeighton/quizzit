import express, { Request, Response } from "npm:express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const currentPlayers: string[] = [];

let gameStarted = false;
let questionNo = 0;
let currentQuestion;

app.post("/hostgame/clientwaiting", async (req: Request, res: Response) => {
    console.log("Waiting for player.");
    try {
        const nextPlayer = await waitForNewPlayers(req.body.players);
        console.log("Returning");
        res.send(nextPlayer);
    } catch (_error) {
        res.status(201);
        res.send("Game Started");
    }
});

app.post("/hostgame/startgame", (_req: Request, res: Response) => {
    res.send("ack");
    gameStarted = true;
});

function waitForNewPlayers(players: number) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (gameStarted) {
                clearInterval(interval);
                reject("GAME STARTED");
            }

            if (players != currentPlayers.length) {
                clearInterval(interval);
                resolve(currentPlayers[currentPlayers.length - 1]);
            }
        }, 50); // Check every 50ms
    });
}

function waitForGameStarting() {
    return new Promise((resolve, _reject) => {
        const interval = setInterval(() => {
            console.log(gameStarted);
            if (gameStarted) {
                clearInterval(interval);
                resolve("GAME STARTED");
            }
        }, 50); // Check every 50ms
    });
}

app.get("/playgame", async (_req: Request, res: Response) => {
    const file = await (Deno.open("public/playGame/index.html"));
    const decoder = new TextDecoder();
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.post("/playgame/waitForStart", async (_req: Request, res: Response) => {
    console.log("Client is waiting for game to start!");
    try {
        await waitForGameStarting();
        console.log("Starting game for client");
        res.send("GAME STARTED");
    } catch (_error) {
        res.status(501);
        res.send("Error");
    }
});

app.post("/playgame/newclient", function (req: Request, res: Response) {
    currentPlayers.push(req.body.Name);
    res.send(currentPlayers);
});

app.post("/hostgame/question", function (req: Request, res: Response) {
    currentQuestion = req.body;
    questionNo++;
    console.log(currentQuestion);
    res.send("Ack");
});

app.post(
    "/hostgame/awaitAnswers",
    async function (_req: Request, res: Response) {
        console.log("Waiting for responses");
        await delay(2000);
        res.send("Boo");
    },
);

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(8000);
