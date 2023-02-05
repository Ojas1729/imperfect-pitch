const sheet = document.getElementById("small_plane");
const ctx = sheet.getContext("2d");
const ymax = sheet.height, xmax = sheet.width;

// create web audio api context
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

function playNote(frequency, duration) {
  // create Oscillator node
  console.log(frequency);
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

dark_colors = ["#800000", "#804000","#808000", "#408000", "#008000", "#008040", 
    "#008080", "#008040", "#000080", "#400080", "#800080", "#800040"];
/*
function hsv_to_rgb(h, s, l){
    let c = s*(1 - Math.abs(2*l - 1));
    let x = c*(1 - (Math.abs(h/60) % 2 - 1));
    let m = l - c/2;
    // using boolean branchless if statements
    let r, g, b;
    if(h >= 0 && h < 60){
        r = c;
        g = x;
        b = 0;
    }
    else if(h >= 60 && h < 120){
        r = x;
        g = c;
        b = 0;
    }
    else if(h >= 120 && h < 180){
        r = 0;
        g = c;
        b = x;
    }
    else if(h >= 180 && h < 240){
        r = 0;
        g = x;
        b = c;
    }
    else if(h >= 240 && h < 300){
        r = x;
        g = 0;
        b = c;
    }
    else{
        r = c;
        g = 0;
        b = x;
    }

    r = Math.floor((r+m)*255).toString(16).padStart(2, "0");
    g = Math.floor((g+m)*255).toString(16).padStart(2, "0");
    b = Math.floor((b+m)*255).toString(16).padStart(2, "0");
    console.log(r, g, b, h, c, x);
    return "#" + r+g+b;

}
*/
N = 100;
for (let i = 0; i < N; i += 1){
    x = 50*(i % num_squares);
    y = 50* Math.floor(i/num_squares);
    ctx.fillStyle = get_color_wheel(i/N, 0.3);
    ctx.fillRect(x, y, 50, 50);
}

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
     
    console.log(scale%1, scale, t);
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
    ctx.fillStyle = "#000000"
    ctx.font = "30px Arial";
    ctx.fillText(Tones[col_wheel_idx] + scale, xmax/2, ymax/2);
    ctx.stroke();
}

function set_color_2(color) { 
    ctx.clearRect(0, 0, xmax, ymax);  
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, xmax, ymax);
    //ctx.fillStyle = "#000000"
    //ctx.font = "30px Arial";
    //ctx.fillText(Tones[col_wheel_idx] + scale, xmax/2, ymax/2);
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

var do_loop = false;
function stop_loop(){
    do_loop = false;
}

async function color_loop(){
    const timeout = 100;
    do_loop = true;
    let s, c;
    let i = 20;
    const max_freq = get_freq(8, 12);
    while (do_loop){
        //s = Math.floor(Math.random()*3);
        //c = Math.floor(Math.random()*colors.length);
        //s = Math.floor(i/12);
        //c = (i) % colors.length;
        playNote(i, timeout);
        
        //set_color(c, s);
        set_color_2(freq_to_color(i));
        i = (i + 1) % max_freq;
        await new Promise(r => setTimeout(r, timeout));
    }
}
//color_loop();
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
