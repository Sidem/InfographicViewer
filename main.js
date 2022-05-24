function toggleAnnotation(id) {
    var annotation = document.getElementById(id+"-body");
    if (annotation.style.display == 'block') {
        annotation.style.display = 'none';
    } else {
        annotation.style.display = 'block';
    }
}

function isMobile() {
    return ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
}

async function getImageDimensionsFromPropertiesXML(propertiesFile) { 
    const response = await fetch(propertiesFile);
    const data = await response.text();
    const image_properties = (new DOMParser()).parseFromString(data, 'text/xml').getElementsByTagName("IMAGE_PROPERTIES")[0];
    return {width:parseInt(image_properties.getAttribute('WIDTH')), height:parseInt(image_properties.getAttribute('HEIGHT'))};
}

async function loadAnnotations() {
    const response = await fetch("annotations.json");
    const data = await response.text();
    return JSON.parse(data).annotations;
}

function prepareOverlays(annotations, imageDimensions) { 
    var overlays = [];
    const imageRatio = imageDimensions.width / imageDimensions.height;
    for(var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        overlays.push({
            id: "annotation-"+i,
            x: (annotation.x/imageDimensions.width)-0.0025,
            y: (annotation.y/(imageDimensions.height*imageRatio))-0.0025,
            width: 0.005,
            height: 0.005,
            className: 'annotation'
        });
    }
    return overlays;
}

window.addEventListener('load', async () => {
    const viewerContainer = document.getElementById('viewer');
    const screenDims = isMobile() ? { width: window.outerWidth, height: window.outerHeight } : { width: window.innerWidth, height: window.innerHeight };
    Object.assign(viewerContainer.style, { width: screenDims.width + 'px', height: screenDims.height + 'px' });
    var imageDimensions = await getImageDimensionsFromPropertiesXML("tiles/ImageProperties.xml");
    const annotations = await loadAnnotations();
    const overlays = prepareOverlays(annotations, imageDimensions)
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
        overlays: overlays,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        sequenceControlAnchor: 'TOP_RIGHT',
        autoHideControls: false
    });
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
            //toggleAnnotation(event.originalTarget.id);
        }
        var webPoint = event.position;
        var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
        var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
        console.log(imagePoint.toString(), viewportPoint.toString(), imagePoint.x/imageDimensions.width, imagePoint.y/imageDimensions.width);
    });
});