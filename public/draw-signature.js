const canvas;
const ctx;
let prevX = 0;
let prevY = 0;
let currX = 0;
let currY = 0;

function init() {
    canvas = document.getElementById('signature');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousemove', (event) => {
        findxy('move', event);
    });
    canvas.addEventListener('mousedown', (event) => {
        findxy('down', event);
    });
    canvas.addEventListener('mouseup', (event) => {
        findxy('up', event);
    });
    canvas.addEventListener('mouseout', (event) => {
        findxy('out', event);
    });
}

function findxy(mouse, event) {
    if (mouse === 'down') {
        prevX = currX;
        prevY = currY;

    }
}
