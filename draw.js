const sheet = document.getElementById("small_plane");
const ctx = sheet.getContext("2d");
const ymax = sheet.height, xmax = sheet.width;

// create web audio api context
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

function playNote(frequency, duration) {
  // create Oscillator node
  var oscillator = audioCtx.createOscillator();

  oscillator.type = 'square';
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.connect(audioCtx.destination);
  oscillator.start();

  setTimeout(
    function() {
      oscillator.stop();
    }, duration);
}

const Tones = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
num_squares = Math.floor(xmax / 50);
function get_rand_color(){
    return Math.floor(Math.random()*256*256*256).toString(16).toUpperCase();
}
colors = ["#FF0000", "#FF8800","#FFFF00", "#88FF00", "#00FF00", "#00FF88", 
    "#00FFFF", "#0000FF", "#8800FF", "#FF00FF", "#FF0088", "#FF0000"];

/*
for (let i = 0; i < colors.length; i += 1){
    x = 50*(i % num_squares);
    y = 50* Math.floor(i/num_squares);
    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, 50, 50);
}
*/ 
function set_color(col_wheel_idx){ 
    //console.log("doing something");
    //console.log(Tones[col_wheel_idx]);
    ctx.clearRect(0, 0, xmax, ymax);  
    ctx.fillStyle = colors[col_wheel_idx];
    ctx.fillRect(0, 0, xmax, ymax);
    ctx.fillStyle = "#000000"
    ctx.font = "30px Arial";
    ctx.fillText(Tones[col_wheel_idx], xmax/2, ymax/2);
    ctx.stroke();
}

async function color_loop(){
    let c = 0;
    let step = Math.pow(2, 1/12);
    while (true){
        c = Math.floor(Math.random()*colors.length);
        playNote(440*Math.pow(step, c), 1000);
        set_color(c);
        await new Promise(r => setTimeout(r, 1000));
    }
}
color_loop();
//console.log("#" + get_rand_color());

function get_rand(xmax, ymax){
    return [Math.floor(Math.random()*xmax), Math.floor(Math.random()*ymax)];
}
/*
ctx.beginPath();
const n = 5;
function draw_rand_segment(ctx){
    const [x1, y1] = get_rand(xmax, ymax), 
        [x2, y2] = get_rand(xmax, ymax);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
for (let i = 0; i < n; i++){
    draw_rand_segment(ctx);
}
draw_rand_segment(ctx);
*/
