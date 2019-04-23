/*
Pixel Measure v0.04 - Photoshop script for adding pixel measurements to your mockups
Copyright (C) 2009 Nikolaj Selvik

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
 Improved and updated by Bezzy Weitz. Specifc code updates include:
- 4 measures using negative space, 2 measures using crosshair selections
You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

-----------------------------------------------------------------------------------------------------------------
Updated by Bezzy Weitz  & Mycort (2/8/2012 - v0.05). Specifc code edits and additions include:
- 4 measures using negative space, 2 measures using crosshair selections, 6 measures of inner/outer box
-----------------------------------------------------------------------------------------------------------------

*/

function runPixelMeasure() {


    var originalUnit = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;

    app.displayDialogs = DialogModes.NO;

    if(validateState())
    {
        app.activeDocument.suspendHistory("Pixel Specs", "createMeasure();");
    }


    function validateState()
    {
        if (app.documents.length == 0)
        {
            alert("No document open");
            return false;
        }

        if(!hasSelection(app.activeDocument))
        {
            alert("Please make a selection to measure");
            return false;
        }

        return true;
    }	


    function createMeasure()
    {
        var docRef = app.activeDocument;
        var selRef = docRef.selection;
        var mainLayerSet;
        var channelRef;
        var is_rect = false;

        // =======================================================
        // Set Up Selection
        // =======================================================

        var fx1 = selRef.bounds[0].value;
        var fy1 = selRef.bounds[1].value;
        var fx2 = selRef.bounds[2].value;
        var fy2 = selRef.bounds[3].value;

        try
        {
            channelRef = docRef.channels.getByName("Pixel Specs");
        }
        catch(error)
        {
            channelRef = docRef.channels.add();
            channelRef.name = "Pixel Specs";
             channelRef.kind = ChannelType.SELECTEDAREA;
        }

        docRef.selection.store(docRef.channels["Pixel Specs"], SelectionType.EXTEND);
        var shapeRef = [ [fx1,fy1],[fx2,fy1],[fx2,fy2],[fx1,fy2] ];
        selRef.select( shapeRef, SelectionType.EXTEND );
        selRef.load( docRef.channels["Pixel Specs"], SelectionType.DIMINISH );
        channelRef.remove();

        try
        {
            var x1 = selRef.bounds[0].value;
            var y1 = selRef.bounds[1].value;
            var x2 = selRef.bounds[2].value;
            var y2 = selRef.bounds[3].value;
        } catch(error)
        {
            // No selection bound - this means getting the inverse resulted in no selection,
            // so assume negative shape did not exist (original selection was rectangle)
            selRef.select( shapeRef );
            is_rect = true;
            x1 = fx1; y1 = fy1; x2 = fx2; y2 = fy2;
        }

        docRef.selection.deselect();

        // =======================================================
        // Create Layer Sets
        // =======================================================

        try
        {
            mainLayerSet = docRef.layerSets.getByName("Pixel Specs");
        }
        catch(error)
        {
            mainLayerSet = docRef.layerSets.add();
            mainLayerSet.name = "Pixel Specs";
        }

       var layerSetRef = mainLayerSet.layerSets.add();

        // =======================================================
        // Draw Labels
        // =======================================================

       var inner = { 'top':false,'bottom':false,'left':false,'right':false };

       // Look for left measurement
       if ( fx1 < x1 )
       {
           inner.left = true;
           if ( fy1 == y1 )
              createLabel( layerSetRef, fx1, fy1, x1, fy1+10, true );
           else if ( fy2 == y2 )
              createLabel( layerSetRef, fx1, fy2-10, x1, fy2, true );
           else
              createLabel( layerSetRef, fx1, parseInt(fy1+(fy2-fy1)/2)-5, x1, parseInt(fy1+(fy2-fy1)/2)+5, true );
       }

       // Look for right measurement
       if ( fx2 > x2 )
       {
           if ( ! inner.left )
               inner.right = true;
           if ( fy1 == y1 )
              createLabel( layerSetRef, x2, fy1, fx2, fy1+10, true );
           else if ( fy2 == y2 )
              createLabel( layerSetRef, x2, fy2-10, fx2, fy2, true );
           else
              createLabel( layerSetRef, x2, parseInt(fy1+(fy2-fy1)/2)-5, fx2, parseInt(fy1+(fy2-fy1)/2)+5, true );
       }

       // Look for top measurement
       if ( fy1 < y1 )
       {
           inner.top = true;
           if ( fx1 == x1 )
              createLabel( layerSetRef, fx1, fy1, fx1+10, y1, false );
           else if ( fx2 == x2 )
              createLabel( layerSetRef, fx2-10, fy1, fx2, y1, false );
           else
              createLabel( layerSetRef, parseInt(fx1+(fx2-fx1)/2)-5, fy1, parseInt(fx1+(fx2-fx1)/2)+5, y1, false );
       }

       // Look for bottom measurement
       if ( fy2 > y2 )
       {
           if ( ! inner.top )
               inner.bottom = true;
           if ( fx1 == x1 )
              createLabel( layerSetRef, fx1, y2, fx1+10, fy2, false );
           else if ( fx2 == x2 )
              createLabel( layerSetRef, fx2-10, y2, fx2, fy2, false );
           else
              createLabel( layerSetRef, parseInt(fx1+(fx2-fx1)/2)-5, y2, parseInt(fx1+(fx2-fx1)/2)+5, fy2, false );
       }


       if ( is_rect )
       {
           // Only label the longest dimension when selection is a single rectangle
            if ( fx2 - fx1 > fy2 - fy1 )
               createLabel( layerSetRef, x1, y1, x2, y2, true );
            else
               createLabel( layerSetRef, x1, y1, x2, y2, false );
       } else
       {
            // Label both dimensions of negative space when it exists
            if ( inner.left )
              createLabel( layerSetRef, x1, y1, x1+10, y2, false );
            if ( inner.right )
              createLabel( layerSetRef, x2-10, y1, x2, y2, false );
            if ( inner.top )
              createLabel( layerSetRef, x1, y1, x2, y1+10, true );
            if ( inner.bottom )
              createLabel( layerSetRef, x1, y2-10, x2, y2, true );

            if ( inner.left == false && inner.right == false && inner.top == false && inner.bottom == false )
            {
                createLabel( layerSetRef, x1, y1, x2, y2, true );
                createLabel( layerSetRef, x1, y1, x2, y2, false );
            }
        }

        app.preferences.rulerUnits = originalUnit;
    }

    function createLabel( layerSetRef, x1, y1, x2, y2, horizontal )
    {
        var linesLayerRef = layerSetRef.artLayers.add();

        var width = x2 - x1;
        var height = y2 - y1;

        // =======================================================
        // Draw Lines
        // =======================================================

        if(horizontal)
        {
            linesLayerRef.name = "Line ";
            drawLine(x1,y1,x1,y1+10);
            drawLine(x2-1,y1,x2-1,y1+10);
            drawLine(x1,y1+5,x2-1,y1+5);
        }
        else
        {
            linesLayerRef.name = "Line ";
            drawLine(x1,y1,x1+10,y1);
            drawLine(x1,y2-1,x1+10,y2-1);
            drawLine(x1+5,y1,x1+5,y2-1);
        }

        // =======================================================
        // Draw Text
        // =======================================================

        var textLayerRef = layerSetRef.artLayers.add();
        textLayerRef.kind = LayerKind.TEXT;
        var textItemRef = textLayerRef.textItem;

        if(horizontal)
        {
            textItemRef.contents = width + " px";
            textItemRef.justification = Justification.CENTER;
            textItemRef.position = Array(Math.floor(x1 + (width/2)),y1+21);
        }
        else
        {
             textItemRef.contents = height + " px";
            textItemRef.position = Array(x1+15,Math.floor(y1 + 4 + (height/2)));
        }

        layerSetRef.name = textItemRef.contents;

        textItemRef.color = app.foregroundColor;
        textItemRef.font = "ArialMT";
        textItemRef.size = 11;
        textItemRef.fauxBold = true;
    }


    function drawLine(x1,y1,x2,y2)
    {
        var pointArray = new Array();

        var pointA = new PathPointInfo();
        pointA.kind = PointKind.CORNERPOINT;
        pointA.anchor = Array(x1, y1);
        pointA.leftDirection = pointA.anchor;
        pointA.rightDirection = pointA.anchor;
        pointArray.push(pointA);

        var pointB = new PathPointInfo();
        pointB.kind = PointKind.CORNERPOINT;
        pointB.anchor = Array(x2, y2);
        pointB.leftDirection = pointB.anchor;
        pointB.rightDirection = pointB.anchor;
        pointArray.push(pointB);

        var line = new SubPathInfo();
        line.operation = ShapeOperation.SHAPEXOR;
        line.closed = false;
        line.entireSubPath = pointArray;

        var lineSubPathArray = new Array();
        lineSubPathArray.push(line);

        var linePath = app.activeDocument.pathItems.add("TempPath", lineSubPathArray);
        linePath.strokePath(ToolType.PENCIL, false);
        app.activeDocument.pathItems.removeAll();
    }

    function hasSelection(doc)
    {
        var res = false;
        var as = doc.activeHistoryState;
        doc.selection.deselect();
        if (as != doc.activeHistoryState)
        {
            res = true;
            doc.activeHistoryState = as;
        }
        return res;
    }
    
}