import express from "npm:express";
const app = express();

app.get("/hostgame/:fileName", async (req: any, res: any) => {
    let fileName = "public/hostGame/" + req.params.fileName
    if (req.params.fileName === "style.css"){
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

app.get("/hostgame", async (req: any, res: any) => {
    const file = await (Deno.open("public/hostGame/index.html"));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.get("/playgame", async (req: any, res: any) => {
    const file = await (Deno.open("public/playGame/index.html"));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.get("/", async (req: any, res: any) => {
    const file = await(Deno.open("public/index.html"));
    const decoder = new TextDecoder;
    let toSend = "";
    for await (const chunk of file.readable) {
        toSend += decoder.decode(chunk);
    }
    res.send(toSend);
});

app.get("/:fileName", async (req: any, res: any) => {
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