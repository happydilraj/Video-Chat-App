//client.js
const socket = io("http://localhost:8000");

let myVideoStream;
const videoGrid = document.getElementById("container-video");
const messageGrid = document.getElementById("container-messages");
const myVideo = document.createElement("video");
const messageInput = document.getElementById("writemessage");
myVideo.classList.add("container-video");
myVideo.muted = true;
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "8000",
});
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    var audio = new Audio("ting.mp3");
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();

    videoGrid.append(video);
  });
};

const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("messages");
  messageElement.classList.add(position);
  messageGrid.append(messageElement);
  audio.play();
};
function send() {
  // e.preventDefault();
  const message = messageInput.value;
  append(`You: ${message}`, "right");
  socket.emit("send", message);
  messageInput.value = "";
}

const name = prompt("Enter your name to join");
socket.emit("new-user-joined", name);

socket.on("user-joined", (name) => {
  append(`${name} joined the chat`, "right");
});
socket.on("receive", (data) => {
  append(`${data.name}: ${data.message}`, "left");
});
socket.on("left", (name) => {
  append(`${name} left the chat`, "left");
});
