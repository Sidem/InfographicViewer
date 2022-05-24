function toggleAnnotation(id) {
    var annotation = document.getElementById(id+"-body");
    if (annotation.style.display == 'block') {
        annotation.style.display = 'none';
    } else {
        annotation.style.display = 'block';
    }
}

async function getImageDimensionsFromPropertiesXML() { 
    const response = await fetch("tiles/ImageProperties.xml");
    const data = await response.text();
    const image_properties = (new DOMParser()).parseFromString(data, 'text/xml').getElementsByTagName("IMAGE_PROPERTIES")[0];
    return {width:parseInt(image_properties.getAttribute('WIDTH')), height:parseInt(image_properties.getAttribute('HEIGHT'))};
}

window.addEventListener('load', async () => {
    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'viewer';
    const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
    const screenDims = isMobile ? { width: window.outerWidth, height: window.outerHeight } : { width: window.innerWidth, height: window.innerHeight };
    Object.assign(viewerContainer.style, { width: screenDims.width + 'px', height: screenDims.height + 'px' });
    document.body.appendChild(viewerContainer);
    var imageDimensions = await getImageDimensionsFromPropertiesXML();
    console.log(imageDimensions);
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
        autoHideControls: false
    });
    console.dir(viewer);
    const styles = document.createElement('link');
    Object.assign(styles, { rel: 'stylesheet', href: 'main.css' });
    document.head.appendChild(styles);
    viewer.addHandler('full-screen', (e) => {
        console.log(e.fullScreen);
    });
    viewer.addHandler('canvas-click', function(event) {
        var clickedAnnotation = (event.originalTarget.className == 'annotation');
        if (clickedAnnotation) {
            event.preventDefaultAction = true;
            console.log(event.originalTarget.id);
            toggleAnnotation(event.originalTarget.id);
        }
        var webPoint = event.position;
        var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
        var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
        console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.x/imageDimensions.width, imagePoint.y/imageDimensions.width);
    });
});