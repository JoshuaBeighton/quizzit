import express, { Request, Response } from "npm:express";

const app = express();
app.use(express.json());

const currentPlayers: string[] = [];

let gameStarted = false;

app.get("/hostgame", async (_req: Request, res: Response) => {
    const file = await (Deno.open("public/hostGame/index.html"));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.get("/hostgame/:fileName", async (req: Request, res: Response) => {
    let fileName = "public/hostGame/" + req.params.fileName
    if (req.params.fileName === "style.css") {
        fileName = "public/style.css";
    }
    const file = await (Deno.open(fileName));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    if (fileName.endsWith(".css")) {
        res.setHeader("content-type", "text/css");
    }
    else if (fileName.endsWith(".js")) {
        res.setHeader("content-type", "application/javascript");
    }
    res.send(toSend);
});

app.post("/hostgame/clientwaiting",async (req: Request, res: Response) => {
    console.log("Waiting for player.")
    const nextPlayer = await waitForNewPlayers(req.body.players);
    console.log("Returning");
    res.send(nextPlayer); 
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
        }, 100); // Check every 100ms
    });
}


app.get("/playgame", async (_req: Request, res: Response) => {
    const file = await (Deno.open("public/playGame/index.html"));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.post("/playgame/newclient", function (req: Request, res: Response){
    console.log("New PLayer Alert!!")
    currentPlayers.push(req.body.Name);
    res.send(currentPlayers);
});

app.get("/playgame/:fileName", async (req: Request, res: Response) => {
    let fileName = "public/playGame/" + req.params.fileName
    if (req.params.fileName === "style.css") {
        fileName = "public/style.css";
    }
    const file = await (Deno.open(fileName));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    if (fileName.endsWith(".css")) {
        res.setHeader("content-type", "text/css");
    }
    else if (fileName.endsWith(".js")) {
        res.setHeader("content-type", "application/javascript");
    }
    res.send(toSend);
});

app.get("/", async (_req: Request, res: Response) => {
    const file = await(Deno.open("public/index.html"));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.get("/:fileName", async (req: Request, res: Response) => {
    const fileName = "public/" + req.params.fileName
    const file = await (Deno.open(fileName));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    if (fileName.endsWith(".css")){
        res.setHeader("content-type", "text/css");
    }
    else if (fileName.endsWith(".js")){
        res.setHeader("content-type", "application/javascript");
    }
    res.send(toSend);
});

app.listen(8000);