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
let defaultPalette = ["#4A5759", "#4A5759"];

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
    ["#0032a0", "#bf0d3e", "#FFFFFF", "#FED141"],

];

let sourceSerif = null;

let audioBuffers = [];

let audioFiles = []

let languages = [
    { "Language": "Irish", "Translation": "Ta grá agam duit" },
    { "Language": "Tagalog", "Translation": "Mahal kita" },
    { "Language": "Farsi", "Translation": "دوستت دارم" },
    { "Language": "English", "Translation": "I love you" },
    { "Language": "Spanish", "Translation": "Te quiero" },
    { "Language": "Portuguese", "Translation": "Eu te amo" },
    { "Language": "Cantonese", "Translation": "我愛你" },
    { "Language": "French", "Translation": "Je t’aime" },
    { "Language": "Mandarin", "Translation": "我爱你" },
    { "Language": "Punjabi", "Translation": "ਮੈਂ ਤੁਹਾਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ" },
    { "Language": "Vietnamese", "Translation": "Em thương anh" },
    { "Language": "Greek", "Translation": "Σ' αγαπώ πάρα πολύ" },
    { "Language": "Telugu", "Translation": "నేను నిన్ను ప్రేమిస్తున్నాను" },
    { "Language": "Hebrew", "Translation": "אני אוהבת אותך" },
    { "Language": "German", "Translation": "Ich liebe dich" },
    { "Language": "Korean", "Translation": "사랑해" },
    { "Language": "Japanese", "Translation": "だいすきだよ" },
    { "Language": "Ukrainian", "Translation": "Я тебе кохаю" },
    { "Language": "Malay", "Translation": "Saya sayang awak" },
    { "Language": "Arabic", "Translation": "أحبك" },
    { "Language": "Hindi", "Translation": "मैं तुमसे प्यार करता हूँ" },
    { "Language": "Swedish", "Translation": "Jag älskar dig" },
    { "Language": "Dutch", "Translation": "Ik hou van jou" },
    { "Language": "Italian", "Translation": "Ti amo" },
    { "Language": "Albanian", "Translation": "Të dua" },
    { "Language": "Filipino", "Translation": "Mahal kita" },


    //     {"Language": "Swahili", "Translation": "Nakupenda"},

]

let maxAmplitudes = [];
let playbackLengths = [];
let waitFrames = 150;
let showAboutInfo = true;


// Load everything here

function preload() {
    shuffleArray(languages, palettes);
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
    // shuffleArray(languages);
    frameRate(30);
    pixelDensity(2);
    createCanvas(windowWidth, windowHeight);
    canvasHeight = windowHeight;
    watercolorLayer = createGraphics(1200, 800);
    totalLines = languages.length;
    for (let i = 0; i < totalLines; i++) {
        // let ink = new InkLine(defaultPalette, null);
        let ink = new InkLine(palettes[i], null);
        ink.setSplatter(1, 0.4 + 1 / 100, 1);
        ink.setEndBubble(0.0);
        ink.setAnalogueness(0.0, 2);
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


function showAbout() {
    background(bgColor[0], bgColor[1], bgColor[2]);
    textSize(35);
    textAlign(CENTER, CENTER);
    fill("#4A5759");
    text("Love's Languages", width / 2, height / 2 - 50);
    textSize(20);
    textAlign(CENTER, CENTER);
    fill("#4A5759");
    text("A generative and data art piece by Pete Cybriwsky", width / 2, height / 2 - 10);

    
    textAlign(CENTER, CENTER);
    fill("#4A5759");
    text("This piece captures our universal language, love. It features a heart, meticulously crafted from the overlapping soundwaves of 'I love you' voiced in 26 languages. These heartfelt expressions, contributed by family, friends, and even some kind-hearted strangers, echo the rich spectrum of love—from the tender bonds of family to the deep stirrings of romantic affection. Each soundwave is infused with colors drawn from the national flags of the countries where these languages resonate, weaving a vibrant tapestry of global unity and affection.", 100, height / 2 + 125, width - 200);

    text("I hope to explore this piece further, adding more languages and exploring the unique shapes of different dialects and voices. It's been a real joy to discover how love is expressed around the world and to see these expressions come to life in this piece.", 100, height / 2 + 250, width - 200);

    text("The piece is about 2 minutes and 30 seconds long, and if on desktop, you may turn on your sound to hear the audio playback. For the best experience, use Google Chrome", 100, height / 2 + 325, width - 200);


    textSize(35);
    text("Click anywhere to begin", width / 2, height - 100)
}

function shuffleArray(array1, array2) {
    for (let i = array1.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [array1[i], array1[j]] = [array1[j], array1[i]];
        if (array2 != null) {
            [array2[i], array2[j]] = [array2[j], array2[i]];
        }
    }
    return array1, array2;
}

let textOffset = 2
let minGridWidth = 100; // Minimum cell width
let minGridHeight = 0// Minimum cell height
let gridWidth = minGridWidth; // Width of each cell
let gridHeight = minGridHeight; // Height of each cell
let rows, cols = 0; // Number of rows and columns in our system
let textBuffer = 10;
let fontSize = 20 * 0.6
let fontSize2 = 1 * fontSize;
let indiOffsetY = 0;


function draw() {
    indiOffsetY = 3 * height / 6
    if (!showAboutInfo) {
        if (showBuffer && audioBuffers[languages.length - 1] != null && maxAmplitudes != []) {
            let scale = 5; // Adjust scale to fit the heart shape in your canvas
            angleMode(RADIANS)
            for (let gridY = 0; gridY < rows; gridY++) {
                for (let gridX = 0; gridX < cols; gridX++) {
                    if (gridX + (cols * gridY) < languages.length) {
                        let bufferLength = audioBuffers[(gridX + (cols * gridY)) % audioBuffers.length].length;
                        let data = audioBuffers[((gridX + (cols * gridY)) % audioBuffers.length)].getChannelData(0);


                        let offsetX = gridWidth * gridX + gridWidth / 2;
                        let offsetY = gridHeight * gridY + gridHeight / 2 + indiOffsetY;

                        let areaX = gridWidth * gridX
                        let areaY = gridHeight * gridY
                        clickableAreas.push({ x: areaX, y: areaY + indiOffsetY, width: gridWidth, height: gridHeight, index: gridX + (cols * gridY) });

                        let linePoints = [];
                        let heartLinePoints = []; // Array for this heart's points
                        for (let i = 0; i < bufferLength; i += inc) {
                            let finalX, finalY;

                            let amplitude = map(data[i], -1 * maxAmplitudes[(gridX + (cols * gridY)) % (languages.length)], maxAmplitudes[(gridX + (cols * gridY)) % (languages.length)] * 1, -gridHeight * 0.5, gridHeight * 0.5, true);
                            // Normalize the amplitude based on the maximum amplitude

                            // finalX = offsetX - gridWidth / 2 + map(i, 0, bufferLength, width/5, 4.0*width/5, true)
                            scale = 10
                            finalX = map(i, 0, bufferLength, width / 10, 9 * width / 10, true)
                            finalY = indiOffsetY - 1.5 / 6 * height - amplitude
                            heartShapePoint = heartShape(map(i, 0, bufferLength, 0, TWO_PI, true));


                            finalX = width / 2 + heartShapePoint.position.x * scale;
                            finalY = height / 2.8 + heartShapePoint.position.y * scale + amplitude
                            linePoints.push({ x: finalX, y: finalY });

                            finalX = offsetX - gridWidth / 2 + map(i, 0, bufferLength, gridWidth / 5, 4.0 * gridWidth / 5, true)
                            amplitude = map(data[i], -1 * maxAmplitudes[(gridX + (cols * gridY)) % (languages.length)], maxAmplitudes[(gridX + (cols * gridY)) % (languages.length)] * 1, -gridHeight / 4, gridHeight / 4, true);

                            finalY = offsetY - amplitude
                            heartLinePoints.push({ x: finalX, y: finalY });
                        }

                        allHeartPoints.push(heartLinePoints);
                        allLinePoints.push(linePoints);

                        // Draw text box under each heart

                        fill(lines[(gridX + (cols * gridY)) % (languages.length)].colors[0]);
                        textSize(fontSize);
                        textAlign(CENTER, BOTTOM);
                        text(languages[(gridX + (cols * gridY)) % (languages.length)].Translation, offsetX, offsetY - textOffset / 2 + gridHeight / 2);
                        textSize(fontSize2);
                        textAlign(CENTER, TOP);
                        text(languages[(gridX + (cols * gridY)) % (languages.length)].Language, offsetX, offsetY + textOffset * 2 + gridHeight / 2);
                    }
                }
            }

            fill("#4A5759");
            textSize(fontSize * 1.25);
            textAlign(LEFT, BOTTOM);
            // text("Love's Languages", textBuffer, 40);
            textAlign(LEFT, TOP);
            showBuffer = false;
        }

        // Draw each heart using its respective points
        for (let i = 0; i < languages.length; i++) {
            currentLine = lines[i];
            currentLine.setPoints(allHeartPoints[i])
            currentLine.setAnalogueness(0.0, 2)
            push()
            // translate(0, height/2)
            currentLine.animateLine(null, null, null, null, frames * inc, (frames + 1) * inc)
            currentLine.setPoints(allLinePoints[i])
            pop()
            currentLine.setAnalogueness(0.0, 2);
            push()
            currentLine.colors = palettes[i % palettes.length]
            translate(0, -height / 8)
            currentLine.animateLine(null, null, null, null, frames * inc, (frames + 1) * inc)
            pop()
        }
        frames++
        if (waitFrames < 0) {
            waitFrames = 150;
            redrawVisualIndex++;
            if (redrawVisualIndex >= clickableAreas.length) {
                background(bgColor[0], bgColor[1], bgColor[2]);
                showFinalVisual = true;
                redrawVisualFrames = 0;

            }
            else {
                let area = clickableAreas[redrawVisualIndex % clickableAreas.length];
                audioFiles[redrawVisualIndex].play();
                redrawVisual = true;
                redrawVisualArea = area;
                redrawVisualFrames = 0;
                redrawFrameText = true
            }
        }
        waitFrames--;

        if (redrawVisual && showFinalVisual == false) {
            redrawVisualForArea(redrawVisualArea, redrawVisualIndex);
        }

        if (showFinalVisual) {
            finalVisual()
        }
    }
    else {
        showAbout();
    }
}


let frames = 0;
let drawHeart = true;
let redrawVisual = false;
let redrawVisualIndex = -1;
let redrawVisualFrames = 0;
let redrawVisualArea = null;
let redrawFrameText = true;
let showFinalVisual = false;

function calculateGrid() {
    cols = 9
    rows = Math.ceil(totalLines / cols)
    minGridHeight = (0.4 * canvasHeight) / rows

    gridWidth = windowWidth / cols;
    gridHeight = minGridHeight;

    canvasHeight = rows * gridHeight;
}

function redrawVisualForArea(area, index) {
    let totalFrames = allLinePoints[index].length / inc;
    let ratio = totalFrames / playbackLengths[index]
    frameRate(ratio + 2)
    for (let l = 0; l < languages.length; l++) {
        let tempInc = Math.round(allLinePoints[l].length / totalFrames)
        currentLine = lines[l];
        if (l != index) {
            currentLine.colors = defaultPalette
        }

        else {
            currentLine.colors = palettes[index % palettes.length]
        }

        push()
        currentLine.setPoints(allHeartPoints[l])
        currentLine.animateLine(null, null, null, null, (redrawVisualFrames + 2) * tempInc, (redrawVisualFrames + 3) * tempInc)
        pop()

        // currentLine.setAnalogueness(0.1, 2);
        push()
        translate(0, -height / 8)
        currentLine.setPoints(allLinePoints[l])
        currentLine.animateLine(null, null, null, null, (redrawVisualFrames + 2) * tempInc, (redrawVisualFrames + 3) * tempInc)
        pop()
    }

    currentLine = lines[index];
    currentLine.colors = palettes[index % palettes.length]
    currentLine.setPoints(allHeartPoints[index])
    // currentLine.setAnalogueness(0.1, 10);

    push()
    translate(0, -height / 8)
    currentLine.setPoints(allLinePoints[index])
    currentLine.animateLine(null, null, null, null, redrawVisualFrames * inc, (redrawVisualFrames + 1) * inc)
    pop()
    redrawVisualFrames++;
    if (redrawFrameText) {
        for (let i = 0; i < languages.length; i++) {
            if (i == index) {
                fill(lines[index].colors[0]);
            } else {
                fill(defaultPalette[0]);
            }
            textSize(fontSize);
            textAlign(CENTER, BOTTOM);

            text(languages[i].Translation, clickableAreas[i].x + gridWidth / 2, clickableAreas[i].y + gridHeight / 2 - textOffset / 2 + gridHeight / 2);
            textSize(fontSize2);
            textAlign(CENTER, TOP);
            text(languages[i].Language, clickableAreas[i].x + gridWidth / 2, clickableAreas[i].y + gridHeight / 2 + textOffset * 2 + gridHeight / 2);
            redrawFrameText = false;
        }
    }
    if ((redrawVisualFrames * inc) >= allLinePoints[index].length) {
        redrawVisual = false;
    }
}
function finalVisual() {
    let done = true;
    for (let l = 0; l < languages.length; l++) {
        currentLine = lines[l];
        currentLine.colors = palettes[l % palettes.length]
        push()
        translate(0, height / 8)
        currentLine.setPoints(allLinePoints[l])
        currentLine.animateLine(null, null, null, null, (redrawVisualFrames) * inc, (redrawVisualFrames + 1) * inc)
        pop()
        if (redrawVisualFrames * inc < allLinePoints[l].length) {
            done = false;
        }
    }
    redrawVisualFrames++;
    if (done) {
        textSize(fontSize * 4);
        textAlign(CENTER, CENTER);
        fill("#4A5759");
        noLoop();
    }
}

function mouseClicked() {
    
    if (showAboutInfo) {
        showAboutInfo = false;
        background(bgColor[0], bgColor[1], bgColor[2]);
    }
    else if (frames > 100 && redrawVisual == false && showFinalVisual == false){
        for (let area of clickableAreas) {
            if (mouseX > area.x && mouseX < area.x + area.width &&
                mouseY > area.y && mouseY < area.y + area.height) {
                // Play the corresponding audio file
                waitFrames = 150;
                fill(bgColor[0], bgColor[1], bgColor[2])
                noStroke()
                // rect(area.x, area.y, area.width, area.height);
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
}

function touchStarted() {
    mouseClicked();
}


function windowResized() {
    calculateGrid();
    frames = 0;
    showBuffer = true;
    allHeartPoints = [];
    allLinePoints = []
    clickableAreas = [];
    background(bgColor[0], bgColor[1], bgColor[2]);
    draw();
}

function keyPressed() {
    if (key === "s") {
        saveCanvas("lines.png");
    }
}
