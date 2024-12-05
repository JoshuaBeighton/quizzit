document.addEventListener("DOMContentLoaded", ()=>{
    const button = document.querySelector("#join_button");
    button.addEventListener("click", ()=>{
        const username = document.querySelector("#input_name").value;
        if (username.length > 0){
        const req = new XMLHttpRequest();
        req.open("POST", "/playgame/newclient", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = () => {
            document.querySelector("#join_form").classList.add("hidden");
            document.querySelector("#waiting_text").classList.remove("hidden");
        };
        req.send('{"Name":"'+username+'"}');
        }
        else{
            document.querySelector("#input_name").classList.add("incorrect");
        }
    });
});