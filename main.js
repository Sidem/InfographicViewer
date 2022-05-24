

window.addEventListener('load', () => {
    var viewerContainer = document.createElement('div');
    viewerContainer.id = 'viewer';
    var screenDims = { width: window.outerWidth, height: window.outerHeight };
    viewerContainer.style.width = window.outerWidth + 'px';
    viewerContainer.style.height = window.outerHeight + 'px';
    document.body.appendChild(viewerContainer);
    var imageDimensions = {width:8000, height:4406};
    var viewer = OpenSeadragon({
        id: "viewer",
        prefixUrl: "images/",
        tileSources: [{
            //required	
            type:       "zoomifytileservice",
            width:      imageDimensions.width,
            height:     imageDimensions.height,
            tilesUrl:   "tiles/",
            //optional
            tileSize: 256,
            fileFormat: 'jpg'	
        }],
        overlays: [{
            id: 'example-overlay',
            x: 0.13,
            y: 0.15,
            width: 0.02,
            height: 0.02,
            className: 'annotation'
        }],
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        sequenceControlAnchor: 'TOP_RIGHT',
        navigatorWidth: (screenDims/3),
        navigatorHeight: (screenDims/3)*(imageDimensions.width/imageDimensions.height),
        autoHideControls: false
    });

    var styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = 'main.css';
    document.head.appendChild(styles);
    viewer.addHandler('full-screen', (e) => {
        console.log(e.fullScreen);
    });
    viewer.addHandler('canvas-click', function(event) {
        console.log(event.originalTarget);
        if (event.originalTarget.className == 'annotation') {
            event.preventDefaultAction = true;
        }
        // The canvas-click event gives us a position in web coordinates.
        var webPoint = event.position;
    
        // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
        var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    
        // Convert from viewport coordinates to image coordinates.
        var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
    
        // Show the results.
        console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.x/imageDimensions.width, imagePoint.y/imageDimensions.width);
    });
});