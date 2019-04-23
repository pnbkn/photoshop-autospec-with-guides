//@include "Pixel-Measure-Multi.jsx";


function sortNumber(a,b) {
    return a - b;
}

// Count the Guides on a page and divide them into Horizontal and Vertical Guides
function guideCount()
{
    var doc = app.activeDocument;
    var guideHArray = [];
    var guideVArray = [];
    var guideHPos;
    var guideVPos;
    var xLeft;
    var xRight;
    var yTop;
    var yBottom;
    var newSelectionHoz;
    var newSelectionVert;
    
    for (var i=0; i < app.activeDocument.guides.length; i++)
        {
            
           if(app.activeDocument.guides[i].direction===Direction.HORIZONTAL) {
 
            //var guideName = app.activeDocument.guides;
            //guideName = typename + i;
            guideHPos = parseInt(app.activeDocument.guides[i].coordinate);
            guideHArray.push(guideHPos);
            guideHArray.sort(sortNumber);
            }
            
           if(app.activeDocument.guides[i].direction===Direction.VERTICAL) {
 
            //var guideName = app.activeDocument.guides;
            //guideName = typename + i;
            guideVPos = parseInt(app.activeDocument.guides[i].coordinate);
            guideVArray.push(guideVPos);
            guideVArray.sort(sortNumber);
            }
            

        }
         // Array for Horizontal Guides
            for (var j=0; j < guideHArray.length-1; j++){
              
              xLeft = app.activeDocument.width / 2;
              yTop = guideHArray[j];
              xRight = app.activeDocument.width /2 + 1;
              yBottom = (guideHArray[j+1]+1);
              newSelectionHoz = [ [xLeft,yTop], [xLeft,yBottom], [xRight,yBottom], [xRight,yTop] ]; // set coords for selection, counter-clockwise
              doc.selection.select(newSelectionHoz);
              //alert(newSelection);
              runPixelMeasure(); // Run the Pixel Measure Tool
             //doc.selection.deselect(); 
            }
        // Array for Vertical Guides
            for (var k=0; k < guideVArray.length-1; k++){
              
              xLeft = app.activeDocument.height / 2;
              yTop = guideVArray[k];
              xRight = app.activeDocument.height /2 + 1;
              yBottom = (guideVArray[k+1]+1);
              newSelectionVert = [ [yTop, xLeft], [yBottom, xLeft], [yBottom, xRight], [yTop, xRight] ]; // set coords for selection, counter-clockwise
              doc.selection.select(newSelectionVert);
              //alert(newSelection);
              runPixelMeasure(); // Run the Pixel Measure Tool
             //doc.selection.deselect(); 
                
            }
   
}

guideCount();