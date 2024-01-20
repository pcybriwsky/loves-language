let inkLine;
let colors = [];
let lines = [];
let totalLines = 16;
let lineInterval = 0;
let layers = 0;
let offset = [];
let mic;
let audioContext, audioBuffer;

let watercolorLayer = null;

let bgColor = [246, 244, 243]
let levels = [];
let points = 140;
let weight = 140;

let currentLine = null;
let showBuffer = true;
let inc = 40;
let allHeartPoints = [];
let allLinePoints = []
let clickableAreas = [];
let defaultPalette = ["#4A5759", "#CAD2C5", "#4A5759"];

let palettes = [
    ["#009A49", "#FFFFFF", "#FF7900"],
    ["#0038A8", "#CE1126", "#FFFFFF", "#FCD116"],
    ["#239F40", "#FFFFFF", "#DA0000"],
    ["#00247D", "#FFFFFF", "#CF142B"],
    ["#C60D1F", "#FFC400"],
    ["#006600", "#FF0000"],
    ["#FF0000", "#FFFFFF"],
    ["#0055A4", "#FFFFFF", "#EF4135"],
    ["#DE2910", "#FFDE00"],
    ["#FF9933", "#FFFFFF", "#138808", "#000080"],
    ["#DA251D", "#FFCD00"],
    ["#0D5EAF", "#FFFFFF"],
    ["#FF9933", "#FFFFFF", "#138808", "#000080"],
    ["#0038A8", "#FFFFFF"],
    ["#000000", "#DD0000", "#FFCC00"],
    ["#000000", "#FFFFFF", "#C91A09", "#003478"],
    ["#BC002D", "#FFFFFF"],
    ["#0057B7", "#FFD700"],
    ["#010066", "#FFCC00", "#FFFFFF", "#CC0000"],
    ["#007A3D", "#FFFFFF", "#C8102E", "#000000"],
    ["#FF9933", "#FFFFFF", "#138808", "#000080"],
    ["#005CBF", "#FFCD00"],
    ["#21468B", "#FFFFFF", "#AE1C28"],
    ["#008C45", "#FFFFFF", "#CD212A"],
    ["#DA291C", "#000000"],

];

let sourceSerif = null;

let audioBuffers = [];

let audioFiles = []

let languages = [
    { "Language": "Irish", "Translation": "Ta grá agam duit" },
    { "Language": "Tagalog", "Translation": "I love you" },
    { "Language": "Farsi", "Translation": "I love you" },
    { "Language": "English", "Translation": "I love you" },
    { "Language": "Spanish", "Translation": "te quiero" },
    { "Language": "Portuguese", "Translation": "Eu te amo" },
    { "Language": "Cantonese", "Translation": "我愛你" },
    { "Language": "French", "Translation": "Je t’aime" },
    { "Language": "Mandarin", "Translation": "我爱你" },
    { "Language": "Punjabi", "Translation": "ਮੈਂ ਤੁਹਾਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ" },
    { "Language": "Vietnamese", "Translation": "Em thương anh" },
    { "Language": "Greek", "Translation": "Σ' αγαπώ" },
    { "Language": "Telugu", "Translation": "నేను నిన్ను ప్రేమిస్తున్నాను" },
    { "Language": "Hebrew", "Translation": "אני אוהבת אותך" },
    { "Language": "German", "Translation": "Ich liebe dich" },
    { "Language": "Korean", "Translation": "사랑해" },
    { "Language": "Japanese", "Translation": "だいすきだよ" },
    { "Language": "Ukrainian", "Translation": "Я тебе кохаю" },
    { "Language": "Malay", "Translation": "Saya cinta padamu" },
    { "Language": "Arabic", "Translation": "أحبك" },
    { "Language": "Hindi", "Translation": "أحبك" },
    { "Language": "Swedish", "Translation": "Jag älskar dig" },
    { "Language": "Dutch", "Translation": "Ik hou van jou" },
    { "Language": "Italian", "Translation": "Ti amo" },
    { "Language": "Albanian", "Translation": "Të dua" },


    //     {"Language": "Swahili", "Translation": "Nakupenda"},

]

let maxAmplitudes = [];
let playbackLengths = [];


// Load everything here

function preload() {
    audioBuffers = new Array(languages.length).fill(null);
    playbackLengths = new Array(languages.length).fill(null);
    maxAmplitudes = new Array(languages.length).fill(null);

    for (i = 0; i < languages.length; i++) {
        audioContext = new AudioContext();
        let index = i;
        fetch("./" + languages[i].Language + ".mp3")
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
            .then((buffer) => {

                audioBuffer = buffer;
                audioBuffers[index] = audioBuffer
                playbackLengths[index] = buffer.duration
                let amplitude = buffer.getChannelData(0);
                let maxAmplitude = 0;
                for (let k = 0; k < amplitude.length; k++) {
                    if (Math.abs(amplitude[k]) > maxAmplitude) {
                        maxAmplitude = Math.abs(amplitude[k]);
                    }
                }
                maxAmplitudes[index] = maxAmplitude;
            })
            .catch((e) => console.error(e));
        let sound = loadSound("./" + languages[i].Language + ".mp3");
        audioFiles.push(sound);

    }
}

let canvasHeight = 0;
function setup() {
    //   shuffleArray(languages);
    frameRate(60);
    pixelDensity(1);
    createCanvas(windowWidth, windowHeight);
    canvasHeight = windowHeight;
    watercolorLayer = createGraphics(1200, 800);
    totalLines = languages.length;
    for (let i = 0; i < totalLines; i++) {
        // let ink = new InkLine(defaultPalette, null);
        let ink = new InkLine(palettes[i], null);
        ink.setSplatter(1, 0.4 + 1 / 100, 1);
        ink.setEndBubble(0.0);
        ink.setAnalogueness(0.2, 1);
        ink.setStops(0);
        lines.push(ink);
    }
    currentLine = lines[0];
    textFont('Noto Sans');
    calculateGrid();
    background(bgColor[0], bgColor[1], bgColor[2]);
}





function heartShape(t) {
    // Heart shape formula
    let x = 16 * pow(sin(t), 3);
    let y = -(13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
    return { position: createVector(x, y) };
}



function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

let textOffset = 5
let minGridWidth = 100; // Minimum cell width
let minGridHeight = 0// Minimum cell height
let gridWidth = minGridWidth; // Width of each cell
let gridHeight = minGridHeight; // Height of each cell
let rows, cols = 0; // Number of rows and columns in our system
let textBuffer = 2;
let fontSize = 20;
let fontSize2 = 1 * fontSize;

function draw() {
    if (showBuffer && audioBuffers[languages.length - 1] != null && maxAmplitudes != []) {
        let scale = 5; // Adjust scale to fit the heart shape in your canvas
        angleMode(RADIANS)
        for (let gridY = 0; gridY < rows; gridY++) {
            for (let gridX = 0; gridX < cols; gridX++) {

                let bufferLength = audioBuffers[(gridX + (cols * gridY)) % audioBuffers.length].length;
                let data = audioBuffers[((gridX + (cols * gridY)) % audioBuffers.length)].getChannelData(0);


                let offsetX = gridWidth * gridX + gridWidth / 2;
                let offsetY = gridHeight * gridY + gridHeight / 2;

                let areaX = gridWidth * gridX
                let areaY = gridHeight * gridY
                clickableAreas.push({ x: areaX, y: areaY, width: gridWidth, height: gridHeight, index: gridX + (cols * gridY) });

                let linePoints = [];
                let heartLinePoints = []; // Array for this heart's points
                for (let i = 0; i < bufferLength; i += inc) {
                    let finalX, finalY;

                    let amplitude = map(data[i], -1 * maxAmplitudes[(gridX + (cols * gridY)) % (languages.length)], maxAmplitudes[(gridX + (cols * gridY)) % (languages.length)] * 1, -gridHeight / 3, gridHeight / 3, true);
                    // Normalize the amplitude based on the maximum amplitude

                    finalX = offsetX - gridWidth / 2 + map(i, 0, bufferLength, width/5, 4.0*width/5, true)
                    finalY = offsetY + gridHeight / 32 - amplitude
                    linePoints.push({ x: finalX, y: finalY });


                    let scalar = 1.5;

                    let t = map(i, 0, bufferLength, 0, TWO_PI); //

                    // Map buffer index to angle
                    let heartPoint = heartShape(t);
                    // Calculate the displaced point
                    let normalX = heartPoint.position.x
                    let normalY = heartPoint.position.y

                    finalX = normalX * scalar + offsetX + 2*gridWidth/5;
                    finalY = normalY * scalar + offsetY;
                    heartLinePoints.push({ x: finalX, y: finalY });
                }

                allHeartPoints.push(heartLinePoints);
                allLinePoints.push(linePoints);

                // Add this heart's points to the main array

                // Draw text box under each heart
                // console.log(lines[(gridX + (cols * gridY)) % (languages.length)].colors)
                fill(lines[(gridX + (cols * gridY)) % (languages.length)].colors[0]);
                // stroke(0)
                // strokeWeight(1)
                textSize(fontSize);
                textAlign(LEFT, BOTTOM);
                text(languages[(gridX + (cols * gridY)) % (languages.length)].Translation, textBuffer, offsetY - textOffset/2);
                textSize(fontSize2);
                textAlign(LEFT, TOP);
                text(languages[(gridX + (cols * gridY)) % (languages.length)].Language, textBuffer, offsetY + textOffset*2);
            }
        }

        fill("#4A5759");
        textSize(fontSize*1.25);
        textAlign(LEFT, BOTTOM);
        text("Love's", textBuffer, height - 40);
        textAlign(LEFT, TOP);
        textSize(fontSize2*1.25);
        text("Languages", textBuffer, height - 40);
        
        showBuffer = false;
    }

    // Draw each heart using its respective points
    for (let i = 0; i < allHeartPoints.length; i++) {
        currentLine = lines[i];
        currentLine.setPoints(allHeartPoints[i])
        currentLine.setAnalogueness(0.1, 10);
        currentLine.animateLine(null, null, null, null, frames * inc, (frames + 1) * inc)
        currentLine.setPoints(allLinePoints[i])
        currentLine.setAnalogueness(0.1, 1);
        currentLine.animateLine(null, null, null, null, frames * inc, (frames + 1) * inc)
    }
    frames++
    if (redrawVisual) {
        redrawVisualForArea(redrawVisualArea, redrawVisualIndex);
    }

   
}

function scaledHeartShape(t, scale, offsetX, offsetY) {
    let v = heartShape(t);
    v.mult(scale); // Scale the heart shape
    v.add(offsetX, offsetY); // Translate the heart shape to desired position
    return v;
}


let frames = 0;
let drawHeart = true;
let redrawVisual = false;
let redrawVisualIndex = 0;
let redrawVisualFrames = 0;
let redrawVisualArea = null;
let redrawFrameText = true;

function calculateGrid() {
    minGridHeight = (0.95*canvasHeight)/languages.length; 
    cols = 1
    rows = totalLines
    // Adjust cell size if the window size doesn't fit perfectly
    gridWidth = windowWidth / cols;
    gridHeight = minGridHeight

    canvasHeight = rows * gridHeight; 
    
    // resizeCanvas(windowWidth, windowHeight);
    // background(bgColor[0], bgColor[1], bgColor[2]);

    
    // Additional adjustments if needed...
}

function redrawVisualForArea(area, index) {
    let totalFrames = allLinePoints[index].length / inc;
    let ratio = totalFrames / playbackLengths[index]
    frameRate(ratio+2)
    currentLine = lines[index];
    currentLine.colors = palettes[index % palettes.length]
    currentLine.setPoints(allHeartPoints[index])
    currentLine.setAnalogueness(0.1, 20);
    // currentLine.animateLine(null, null, null, null, redrawVisualFrames * inc, (redrawVisualFrames + 1) * inc)
    currentLine.setPoints(allLinePoints[index])
    currentLine.setAnalogueness(0.1, 1);
    currentLine.animateLine(null, null, null, null, redrawVisualFrames * inc, (redrawVisualFrames + 1) * inc)
    redrawVisualFrames++;

    if (redrawFrameText) {
        fill(lines[index].colors[0]);
        // strokeWeight(1)
        textSize(fontSize);
        textAlign(LEFT, BOTTOM);
        text(languages[index].Translation, textBuffer, area.y + area.height / 2 - textOffset/2);
        textSize(fontSize2);
        textAlign(LEFT, TOP);
        text(languages[index].Language, textBuffer, area.y + area.height / 2 + textOffset*2);

        // textAlign(LEFT, BOTTOM);
        //         text(languages[(gridX + (cols * gridY)) % (languages.length)].Translation, textBuffer, offsetY - textOffset);
        //         textSize(16);
        //         textAlign(LEFT, TOP);
        //         text(languages[(gridX + (cols * gridY)) % (languages.length)].Language, textBuffer, offsetY - textOffset);
        redrawFrameText = false;
    }
    if ((redrawVisualFrames * inc) >= allLinePoints[index].length) {
        redrawVisual = false;
    }
}

function mouseClicked() {
    for (let area of clickableAreas) {
        if (mouseX > area.x && mouseX < area.x + area.width &&
            mouseY > area.y && mouseY < area.y + area.height) {
            // Play the corresponding audio file
            fill(bgColor[0], bgColor[1], bgColor[2])
            noStroke()
            rect(area.x, area.y, area.width, area.height);
            audioFiles[area.index].play();
            redrawVisual = true;
            redrawVisualIndex = area.index;
            redrawVisualArea = area;
            redrawVisualFrames = 0;
            redrawFrameText = true
            break; // Stop checking further if one match is found
        }
    }
}

function windowResized() {
    calculateGrid();
    frames = 0;
    showBuffer = true;
    allHeartPoints = [];
    allLinePoints = []
    clickableAreas = [];
    draw();
}

function keyPressed() {
    if (key === "s") {
        saveCanvas("lines.png");
    }
}
