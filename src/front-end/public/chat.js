const ws = new WebSocket(`wss://${window.location.host}`);
ws.binaryType = "blob";

ws.addEventListener("open", () => {
  console.log("WebSocket connection opened");
});

ws.addEventListener("close", () => {
  console.log("WebSocket connection closed");
});

ws.addEventListener("message", (message) => {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msgCtn");

  if (message.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      msgDiv.textContent = reader.result; // Prevents HTML interpretation
      document.getElementById("messages").appendChild(msgDiv);
    };
    reader.readAsText(message.data);
  } else {
    console.log("Received: " + message.data);
    msgDiv.textContent = message.data; // Prevents HTML interpretation
    document.getElementById("messages").appendChild(msgDiv);
  }
});

document.getElementById("msgForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const inputBox = document.getElementById("inputBox");
  const message = inputBox.value.trim();

  if (message) {
    ws.send(message);
    inputBox.value = "";
  }
});
