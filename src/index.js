import "./style.css";
import DailyCall from "./call.js";
import Stats from "./stats.js";

function _localControls() {
  let lcDiv = document.createElement("div");
  lcDiv.id = "local-controls";

  let joinBtn = document.createElement("button");
  joinBtn.onclick = () => {
    daily.join();
  };
  joinBtn.innerHTML = "join";
  lcDiv.appendChild(joinBtn);

  let leaveBtn = document.createElement("button");
  leaveBtn.onclick = () => {
    daily.leave();
  };
  leaveBtn.innerHTML = "leave";
  lcDiv.appendChild(leaveBtn);

  let audioBtn = document.createElement("button");
  audioBtn.id = "audioBtn";
  audioBtn.innerHTML = "mute audio";
  audioBtn.className = "unmuted";
  audioBtn.onclick = () => {
    daily.toggleAudio();
  };
  lcDiv.appendChild(audioBtn);

  let videoBtn = document.createElement("button");
  videoBtn.id = "videoBtn";
  videoBtn.innerHTML = "mute video";
  videoBtn.className = "unmuted";
  videoBtn.onclick = () => {
    daily.toggleVideo();
  };
  lcDiv.appendChild(videoBtn);

  let shushBtn = document.createElement("input");
  shushBtn.type = "checkbox";
  shushBtn.id = "shush";
  shushBtn.onclick = toggleMute;
  lcDiv.appendChild(shushBtn);

  let shushTxt = document.createElement("span");
  shushTxt.innerHTML = "mute audio elements";
  lcDiv.appendChild(shushTxt);

  return lcDiv;
}

function _addGraph(id, name) {
  let div = document.createElement("div");
  div.id = id + "Div";
  div.classList.add("chart-div");

  let title = document.createElement("h2");
  title.innerHTML = name;
  div.appendChild(title);

  let canvas = document.createElement("canvas");
  canvas.id = id + "Chart";
  div.appendChild(canvas);
  return div;
}

function _graphsSection() {
  let graphsDiv = document.createElement("div");
  graphsDiv.classList.add("flex-container");
  graphsDiv.id = "graphs";

  graphsDiv.appendChild(_addGraph("avgJitter", "average jitter"));
  graphsDiv.appendChild(_addGraph("mAvgJitter", "moving average jitter"));
  graphsDiv.appendChild(_addGraph("packetLoss", "packet loss"));
  graphsDiv.appendChild(_addGraph("quality", "quality score"));

  return graphsDiv;
}

function _videoSection() {
  let vidDiv = document.createElement("div");
  vidDiv.classList.add("flex-container");
  vidDiv.id = "vidSection";

  let title = document.createElement("h2");
  title.innerHTML = "videos";
  vidDiv.appendChild(title);

  let vids = document.createElement("div");
  vids.id = "videos";
  vidDiv.appendChild(vids);

  return vidDiv;
}

function toggleMute() {
  const shouldMute = document.getElementById("shush").checked;
  let audioEls = Array.from(document.getElementsByTagName("audio"));
  console.error("shouldMute", shouldMute, audioEls.length);
  for (let el of audioEls) {
    el.muted = shouldMute;
  }
}

window.daily = new DailyCall();
document.body.appendChild(_localControls());
document.body.appendChild(_graphsSection());
document.body.appendChild(_videoSection());
window.stats = new Stats(daily);
