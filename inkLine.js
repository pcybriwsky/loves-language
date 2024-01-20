class InkLine {
  constructor(colors, weight) {
    this.colors = colors;
    this.weight = weight;
    this.drawFunction = null;
    this.points = null;
    this.pointsArray = null;
    this.analogueness = false;
    this.endBubbleP = 0;
    this.splatterStart = 0;
    this.splatterP = 0;
    this.splats = 0;
    this.addStops = 0;
    this.shadeDirections = []
    this.shade = 0;
    this.fillType = null;
    this.maxWeight = 0;
  }

  setAnalogueness(splitP, displacement) {
    this.splitP = splitP;
    this.displacement = displacement;
  }

  setEndBubble(bubbleP) {
    this.endBubbleP = bubbleP;
  }

  setSplatter(minSplatterDistance, splatterP, maxSplats) {
    this.splatterStart = minSplatterDistance;
    this.splatterP = splatterP
    this.maxSplats = maxSplats
  }

  setWeight(weight) {
    this.maxWeight = weight
  }

  setDrawFunction(f) {
    this.drawFunction = f;
  }

  setStops(n) {
    this.addStops = n;
  }

  setShade(shade, direction) {
    this.shade = 1;
    this.shadeDirections.push(direction)
  }

  setType(fillType) {
    this.fillType = fillType;
  }

  setPoints(pointsArray) {
    this.points = pointsArray.length;
    this.pointsArray = pointsArray
  }

  setPointsFunction(x1, y1, x2, y2, numPoints) {
    this.points = this.drawFunction.formula(x1, y1, x2, y2, numPoints);
  }

  drawLine(x1, y1, x2, y2, count) {
    ellipseMode(CENTER);
    let totalColors = this.colors.length;
    let strokeLength = 5000
    let points = this.points
    if (this.points == null) {
      let pointsArray = this.drawFunction.formula(x1, y1, x2, y2, points);
      this.points = pointsArray;
    }

    let displace = 1 - this.splitP;

    let endBubbleProb = this.endBubbleP; // // turn into a var with setter
    let bubbleCheck = (Math.random(1) < endBubbleProb);
    let splatterProb = this.splatterP; // turn into a var with setter
    let willSplatter = (Math.random(1) < splatterProb); // turn into a var based on platter Prob and some random calc

    let splatterDistance = points * this.splatterStart; // turn into a var with setter

    // console.log(this.splats)
    let splats = Math.ceil(random(1, this.maxSplats)); // turn into a var with setter


    let weightF = (n, e) => {
      let weight = map(n, 0, 1, 0, this.maxWeight)
      return ((2 * weight + random(strokeLength)) / width) * e;
    };

    let displaceF = (n, d) => {
      return noise(n) * d;
    };

    let c1 = color(this.colors[0][0], this.colors[0][1], this.colors[0][2]);
    let c2 = color(this.colors[1][0], this.colors[1][1], this.colors[1][2]);

    let showStops = this.addStops;
    // console.log(c1, c2)

    let shade = 1;
    // this.shade = 1;

    console.log(this.pointsArray, points)

    for (let n = 0; n < points; n += 1) {
      if (n < count) {
        let check = Math.random(1);

        let plotPoint = this.pointsArray[n]
        let plotX = plotPoint.x
        let plotY = plotPoint.y

        let inter = map(n, 0, points, 0, 1);
        let c = lerpColor(c1, c2, inter);
        fill(c);
        noStroke()

        if (willSplatter && n > splatterDistance) {
          let totalPointsLeft = points - splatterDistance;
          let cuts = Math.floor(totalPointsLeft / splats);
          if (n % cuts == 0) {

            let displacement = displaceF(n, this.displacement);
            let weight = weightF(inter, 0.2);

            ellipse(
              plotX + displacement / 8,
              plotY + displacement / 8,
              weight + displacement / 8,
              weight + displacement / 8
            );


            if (this.shade) {
              stroke(c)
              strokeWeight(weight)
              let shade = map(n, 0, points, 0, 10)
              line(plotX + shade, plotY + shade, plotX, plotY)
            }
          }
        }
        else if (check > this.splitP) {
          let weight = weightF(inter, 0.15);
          let displacement = displaceF(n, this.displacement);
          ellipse(
            plotX + displacement / 8,
            plotY + displacement / 8,
            weight + displacement / 8,
            weight + displacement / 8
          );

        }
        if (bubbleCheck && n == points - 1 && !willSplatter) {
          let weight = weightF(inter, 0.35);
          ellipse(
            plotX + displacement / 8,
            plotY + displacement / 8,
            weight + displacement / 8,
            weight + displacement / 8
          );
          // rect(
          //     plotX + displacement / 2,
          //     plotY + displacement / 2,
          //     10,
          //     1
          //   );
        }

        if (showStops != 0 && n == 0) {
          let weight = weightF(inter, 0.35);
          ellipse(plotX, plotY, weight, weight);
          textAlign(CENTER, TOP)
          if (this.drawFunction.title == 'line' || this.drawFunction.title == 'wave') {
            if (x1 == x2 && y1 < y2) {
              text("a", plotX, plotY - 20)
            }

            else if (y1 == y2 && x2 > x1) {
              text("a", plotX - 20, plotY)
            }

            else if (y1 == y2 && x2 < x1) {
              text("a", plotX + 20, plotY)
            }

            else {
              text("a", plotX, plotY + 10)
            }



          }
          else {
            text("a", plotX, plotY + 10)
          }
        }

        if (showStops != 0 && n == points - 1) {
          let weight = weightF(inter, 0.35);
          ellipse(plotX, plotY, weight, weight);
          textAlign(CENTER, TOP)
          if (this.drawFunction.title == 'circle') {
            text("b", plotX, plotY + 30)
          }
          else if (this.drawFunction.title == 'spiral') {
            text("b", plotX, plotY - 25)
          }
          else if (this.drawFunction.title == 'line' || this.drawFunction.title == 'wave') {
            // console.log("We're in line") 
            if (x1 == x2) {
              if (y2 < y1) {
                text("b", plotX, plotY - 20)
              }

              else {
                text("b", plotX, plotY + 10)
              }
            }

            else if (y1 == y2) {
              if (x1 > x2) {
                text("b", plotX - 20, plotY)
              }
              else {
                text("b", plotX + 20, plotY)
              }
            }

            else if (y2 > y1) {
              text("b", plotX, plotY - 10)
            }
          }
          else {
            text("b", plotX, plotY + 10)
          }

          // noLoop();
        }
      }
    }
  }

  animateLine(x1, y1, x2, y2, countStart, countEnd) {
    ellipseMode(CENTER);
    let totalColors = this.colors.length;
    let strokeLength = 1
    let points = this.points
    if (this.points == null) {
      let pointsArray = this.drawFunction.formula(x1, y1, x2, y2, points);
      this.points = pointsArray;
    }

    let displace = 1 - this.splitP;

    let endBubbleProb = this.endBubbleP; // // turn into a var with setter
    let bubbleCheck = (Math.random(1) < endBubbleProb);
    let splatterProb = this.splatterP; // turn into a var with setter
    let willSplatter = (Math.random(1) < splatterProb); // turn into a var based on platter Prob and some random calc

    let splatterDistance = points * this.splatterStart; // turn into a var with setter

    // console.log(this.splats)
    let splats = Math.ceil(random(1, this.maxSplats)); // turn into a var with setter


    let weightF = (n, e) => {
      let weight = map(n, 0, 1, 0, this.maxWeight)
      return ((2 * weight + random(strokeLength)) / width) * e;
    };

    let displaceF = (n, d) => {
      return noise(n) * d;
    };

    let colors = [];
    let colorsLength = this.colors.length
    for (let c = 0; c < colorsLength; c++) {
      let c1 = null;
      c1 = color(this.colors[c]);
      colors.push(c1);
    }

    let c1 = null;
    let c2 = null;

    let showStops = this.addStops;

    

    // console.log(this.pointsArray)
    beginShape();
    for (let n = countStart; n < countEnd; n += 1) {
      if (n < points) {
        let check = Math.random(1);
        let plotPoint = this.pointsArray[n]
        // console.log(plotPoint)
        let plotX = plotPoint.x
        let plotY = plotPoint.y

        let colorInter = map(n, 0, points, 0, colorsLength)

        c1 = colors[Math.floor(colorInter)]
        c2 = colors[Math.ceil(colorInter)]

        if (c2 == undefined) {
          c2 = c1;
        }


        let fixedInter = map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);

        let c = lerpColor(c1, c2, fixedInter);
        // fill(c);
        stroke(c);
        noFill();
        stroke(c);
        
        strokeWeight(2)

        weight = 10;

        if (willSplatter && n > splatterDistance) {
          let totalPointsLeft = points - splatterDistance;
          let cuts = Math.floor(totalPointsLeft / splats);
          if (n % cuts == 0) {

            let displacement = displaceF(n, this.displacement);
            let weight = weightF(fixedInter, 0.2);
            vertex(plotX + displacement / 2, plotY + displacement / 2)
            ellipse(
              plotX + displacement / 8,
              plotY + displacement / 8,
              weight + displacement / 2,
              weight + displacement / 2
            );

            if (this.shade) {
              stroke(c)
              strokeWeight(weight)
              let shade = map(n, 0, points, 0, 10)
              line(plotX + shade, plotY + shade, plotX, plotY)
            }
          }
        }
        else if (check > this.splitP) {
          let weight = weightF(fixedInter, 0.15);
          let displacement = displaceF(n, this.displacement);
          vertex(plotX + displacement / 2, plotY + displacement / 2)
          
          // rect(
          //     plotX + displacement / 2,
          //     plotY + displacement / 2,
          //     3,
          //     1
          //   );
          if (this.shade && n % 12 == 0) {
            console.log("In Shade")
            stroke(c)
            strokeWeight(weight)
            // let shade = map(plotY, height/2, 3*height/4, 1, 100, true) + random(-10, 10)
            // line(plotX + shade, plotY - shade, plotX, plotY)
            // line(plotX - shade, plotY - shade, plotX, plotY)
          }
        }
        if (bubbleCheck && n == points - 1 && !willSplatter) {
          let weight = weightF(fixedInter, 0.35);
          ellipse(plotX, plotY, weight, weight);
        }

        if (showStops != 0 && n == 0) {
          let weight = weightF(fixedInter, 0.35);
          ellipse(plotX, plotY, weight, weight);
          textAlign(CENTER, TOP)
          if (this.drawFunction.title == 'line' || this.drawFunction.title == 'wave') {
            if (x1 == x2 && y1 < y2) {
              text("a", plotX, plotY - 20)
            }

            else if (y1 == y2 && x2 > x1) {
              text("a", plotX - 20, plotY)
            }

            else if (y1 == y2 && x2 < x1) {
              text("a", plotX + 20, plotY)
            }

            else {
              text("a", plotX, plotY + 10)
            }



          }
          else {
            text("a", plotX, plotY + 10)
          }
        }

        if (showStops != 0 && n == points - 1) {
          let weight = weightF(fixedInter, 0.35);
          ellipse(plotX, plotY, weight, weight);
          textAlign(CENTER, TOP)
          if (this.drawFunction.title == 'circle') {
            text("b", plotX, plotY + 30)
          }
          else if (this.drawFunction.title == 'spiral') {
            text("b", plotX, plotY - 25)
          }
          else if (this.drawFunction.title == 'line' || this.drawFunction.title == 'wave') {
            // console.log("We're in line") 
            if (x1 == x2) {
              if (y2 < y1) {
                text("b", plotX, plotY - 20)
              }

              else {
                text("b", plotX, plotY + 10)
              }
            }

            else if (y1 == y2) {
              if (x1 > x2) {
                text("b", plotX - 20, plotY)
              }
              else {
                text("b", plotX + 20, plotY)
              }
            }

            else if (y2 > y1) {
              text("b", plotX, plotY - 10)
            }
          }
          else {
            text("b", plotX, plotY + 10)
          }

          // noLoop();
        }
      }
    }
    endShape();
  }

}


