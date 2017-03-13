function $(s) {
    return document.querySelectorAll(s);
}

var lis = document.querySelectorAll(".list li");
for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
        for (var j = 0; j < lis.length; j++) {
            lis[j].className = "";
        }
        this.className = "selected";
        load("/media/" + this.title);
    }
}

// AJAX 异步请求
var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = ac[ac.createGain ? "createGain" : "createGainTime"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
analyser.fftSize = 512;
analyser.connect(gainNode);

var source = null;
var count = 0;
var box = document.getElementById("box");
var height,width;
var canvas = document.createElement("canvas");
box.appendChild(canvas);
function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
}
resize();
window.onresize = resize;

function load(url) {
    var n = ++count;
    source && source[source.stop ? "stop" : "noteOff"]();
    // 终止上一次请求
    xhr.abort();
    // 表示打开一个请求
    xhr.open('GET', url);
    // 请求的返回类型,arraybuffer是一个二进制数据形式
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
        if (n != count) return;
        ac.decodeAudioData(xhr.response, function (buffer) {
            if (n != count) return;
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(analyser);
            bufferSource[bufferSource.start ? "start" : "noteOn"](0);
            source = bufferSource;
        }, function (err) {
            console.log(err);
        });
    };
    xhr.send();
}

function visualizer() {
    var arr = new Uint8Array(analyser.frequencyBinCount);
    requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    function v() {
        analyser.getByteFrequencyData(arr);
        console.log(arr);
        requestAnimationFrame(v);
    }

    requestAnimationFrame(v);
}

visualizer();

function changeVolume(percent) {
    gainNode.gain.value = percent * percent;
}

document.getElementById("volume").onchange = function () {
    changeVolume(this.value / this.max);
};
document.getElementById("volume").onchange();