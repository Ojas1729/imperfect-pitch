const sheet = document.getElementById("small_plane");
const ctx = sheet.getContext("2d");
const ymax = sheet.height, xmax = sheet.width;

// create web audio api context
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var current_note;


function playNote(frequency, duration) {
  // create Oscillator node
  //console.log(frequency);
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

const Tones = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const scales = [...Array(8).keys()];

num_squares = Math.floor(xmax / 50);
function get_rand_color(){
    return Math.floor(Math.random()*256*256*256).toString(16).toUpperCase();
}

colors = ["#FF0000", "#FF8800","#FFFF00", "#88FF00", "#00FF00", "#00FF88", 
    "#00FFFF", "#0080FF", "#0000FF", "#8800FF", "#FF00FF", "#FF0088"];
/*
N = 100;
for (let i = 0; i < N; i += 1){
    x = 50*(i % num_squares);
    y = 50* Math.floor(i/num_squares);
    ctx.fillStyle = get_color_wheel(i/N, 0.3);
    ctx.fillRect(x, y, 50, 50);
}
*/
function linearScale(val, start, end){
    // start <= val <  end
    return (val - start)/(end - start);
}

function toHex(x, max_bright){
    // 0 <= x < 1
    if (typeof max_bright === "undefined") {
        max_bright = 1;
    }
    return Math.floor(x*255*max_bright).toString(16).padStart(2, "0");
}

function get_color_wheel(x, max_bright){
    if (typeof max_bright === "undefined"){
        max_bright = 1;
    } 
    let max = toHex(max_bright);
    if (x <= 1/4){
        return "#"+ max + toHex(linearScale(x, 0, 3/12), max_bright) + "00"; // FF0000 -> FFFF00
    } 
    else if (x <= 5/12){
        return "#" + toHex(1 - linearScale(x, 3/12, 5/12), max_bright) + max + "00"; // FFFF00 -> 00FF00
    }
    else if (x <= 7/12){
        return "#00" + max + toHex(linearScale(x, 5/12, 7/12), max_bright); // 00FF00 -> 00FFFF
    }
    else if (x <= 9/12){ 
        return "#00" + toHex(1 - linearScale(x, 7/12, 9/12), max_bright) + max; // 00FFFF -> 00FF00
    }
    else if (x <= 11/12){
        return "#" + toHex(linearScale(x, 9/12, 11/12), max_bright) + "00" + max; // 00FF00 -> 
    }
    else{
        return "#" + max + "00" + toHex(1 - linearScale(x, 11/12, 1), max_bright)
    }

}

function freq_to_color(freq) {
    let t = freq / 16.35;
    t = 12*Math.log2(t); 
    let scale = t/12;
    let alpha = scale / 8;
     
    //console.log(scale%1, scale, t);
    return get_color_wheel(scale%1, alpha);
}

function set_color(col_wheel_idx, scale){ 
    //console.log("doing something");
    //console.log(Tones[col_wheel_idx]);
    let alpha = 1 - (col_wheel_idx + 12*scale)/(8*12);
    //let alphaStr = Math.floor(256*alpha).toString(16).padStart(2, "0").toUpperCase();
    ctx.clearRect(0, 0, xmax, ymax);  
    ctx.fillStyle = get_color_wheel(col_wheel_idx/12, 1 - alpha);
    ctx.fillRect(0, 0, xmax, ymax);
    ctx.stroke();
}

function set_color_2(freq) {
    color = freq_to_color(freq);
    ctx.clearRect(0, 0, xmax, ymax);  
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, xmax, ymax);
    ctx.stroke();
}
// must be called on clear board
function write_frequency(freq){ 
    ctx.fillStyle = "#000000"
    ctx.font = "30px Arial";
    ctx.fillText("" + freq + " Hz", xmax/2, ymax/2);
    ctx.stroke();
}

function write_note(c, s){ 
    ctx.fillStyle = "#000000"
    ctx.font = "30px Arial";
    ctx.fillText(Tones[c] + s, xmax/2, ymax/2);
    ctx.stroke();
}
function get_freq(c, s){
    return 16.35*Math.pow(2, (1/12)*(c + s*12))
}

function fine_off_tune(c, s){
    let x = get_freq(c, s);
    let prev = get_freq(c-1, s);
    let next = get_freq(c+1, s);
    return prev + (next - prev)*Math.random();
}

let do_loop = false;
function stop_loop(){
    do_loop = false;
}

let g_do_learn_practice_loop = false;
async function learn_practice_loop(){
    let min = 300;
    let max = 600;
    while (g_do_learn_practice_loop){
        let freq = Math.floor(min + Math.random()*(max - min));
        console.log(freq);
        set_color_2(freq);
        playNote(freq, 1000);
        await new Promise(r => setTimeout(r, 3000));
        write_frequency(freq); 
        await new Promise(r => setTimeout(r, 2000))
    }
}

//learn_practice_loop();
async function color_loop(){
    const timeout = 500;
    do_loop = true;
    let s, c;
    let i = 300;
    while (do_loop){
        //s = Math.floor(Math.random()*3);
        //c = Math.floor(Math.random()*colors.length);
        s = Math.floor(i/12);
        c = (i) % colors.length;
        freq = get_freq(c, s);
        console.log(c, s);
        //playNote(i, timeout);
        playNote(freq, timeout);
        set_color_2(freq);
        write_note(c, s);
        //set_color_2(freq_to_color(i));
        i = (i + 1) % (8*12);
        await new Promise(r => setTimeout(r, timeout));
    }
}
//color_loop();
//console.log("#" + get_rand_color());
// handler logic as I couldn't work out inter file communication

let x = document.getElementById("mode_choice");
let y_div = document.getElementById("very_manly_div");
const label_text = "What do you want to";

x.addEventListener("change", e => {
    console.log(x.value);
    if (x.value == ""){
        console.log("pog 1"); 
        g_do_learn_practice_loop = false;
        y_div.setAttribute("hidden", "hidden");
    }
    if (x.value == "Learn") {
        y_div.children[0].innerText = label_text + " learn?"
        y_div.removeAttribute("hidden");
        console.log("pog 2");
    }
    if (x.value == "Practice"){
        y_div.children[0].innerText = label_text + " practice?"
        y_div.removeAttribute("hidden");
        console.log("pog 3");
    }
});

let y = document.getElementById("wooo");
y.addEventListener("change", e => {
    g_do_learn_practice_loop = false;
    if (y.value == "RPT"){
        g_do_learn_practice_loop = true;// global 
        learn_practice_loop();
    }
    if (y.value == "Notes") {
        console.log("NO");
    }
});


