const canvas = document.getElementById('signature');
const ctx = canvas.getContext('2d');
let prevX = 0;
let prevY = 0;
let currX = 0;
let currY = 0;
let flag = false;
let dot_flag = false;

init();

function init() {
    canvas.addEventListener('mousemove', (event) => {
        findxy('move', event);
    });
    canvas.addEventListener('mousedown', (event) => {
        findxy('down', event);
    });
    canvas.addEventListener('mouseup', (event) => {
        findxy('up', event);
        save();
    });
    canvas.addEventListener('mouseout', (event) => {
        findxy('out', event);
        save();
    });
}

function findxy(mouse, event) {
    if (mouse === 'down') {
        prevX = currX;
        prevY = currY;
        currX = event.clientX - canvas.offsetLeft;
        currY = event.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = true;
        }
    }

    if (mouse === 'up' || mouse === 'out') {
        flag = false;
    }

    if (mouse === 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = event.clientX - canvas.offsetLeft;
            currY = event.clientY - canvas.offsetTop;

            draw();
        }
    }
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.stroke();
    ctx.closePath();
}

// save the image data
function save() {
    let dataURL = canvas.toDataURL();
    let signData = document.getElementById('sign_data');
    signData.value = dataURL;
}
