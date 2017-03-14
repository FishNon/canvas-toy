function $(s) {
    return document.querySelectorAll(s);
}
// 获取li
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
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null;
var count = 0;
var box = document.getElementById("box");
var height, width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
box.appendChild(canvas);
var Dots = [];
function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
}
function getDots() {
    Dots = [];
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rgb(" + random(0, 255) + "," + random(0, 255) + (",") + random(0, 255) + ")"
        Dots.push({
            x: x,
            y: y,
            color: color
        })
    }
}
var line;
function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    // 线性渐变
    line = ctx.createLinearGradient(0, 0, 0, height);
    line.addColorStop(0, "red");
    line.addColorStop(0.5, "yellow");
    line.addColorStop(1, "green");
    getDots();
}
resize();
window.onresize = resize;

// 绘制矩形可视化效果
function draw(arr) {
    ctx.clearRect(0, 0, width, height);
    var w = width / size;
    ctx.fillStyle = line;
    for (var i = 0; i < size; i++) {
        if (draw.type == "column") {
            var h = arr[i] / 256 * height;
            ctx.fillRect(w * i, height - h, w * 0.6, h);
        } else if (draw.type == "dot") {
            ctx.beginPath();
            var o = Dots[i];
            var r = arr[i] / 256 * 50;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            g.addColorStop(0, "#fff");
            g.addColorStop(1, o.color);
            ctx.fillStyle = g;
            ctx.fill();
            // ctx.strokeStyle = "#fff";
            // ctx.stroke();
        }
    }
}
draw.type = "column";
var types = document.querySelectorAll("#type li");
for (var k = 0; k < types.length; k++) {
    types[k].onclick = function () {
        for (var m = 0; m < types.length; m++) {
            types[m].className = "";
        }
        this.className = "selected";
        draw.type = this.getAttribute("data-type");
    }
}


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
        draw(arr);
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