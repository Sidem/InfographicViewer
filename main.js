const overlaySize = 0.012;
function toggleNav(container) {
    var newSize = (document.getElementById("sidebar").style.width != "250px") ? "250px" : "0px";
    document.getElementById("sidebar").style.width = newSize;
    container.style.marginLeft = newSize;
}

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

function loadOverlays(annotations, imageDimensions) {
    var overlays = [];
    const imageRatio = imageDimensions.width / imageDimensions.height;
    for(var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        overlays.push({
            id: "annotation-"+i,
            x: (annotation.x/imageDimensions.width)-(overlaySize/2),
            y: (annotation.y/(imageDimensions.height*imageRatio))-(overlaySize/2),
            width: overlaySize,
            height: overlaySize,
            className: 'annotation'
        });
        window.localStorage.setItem("annotation-"+i, JSON.stringify({
            title: annotation.title,
            body: annotation.body
        }));
    }
    return overlays;
}

function addHandlers(viewer, imageDimensions) {
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
}

window.addEventListener('load', async () => {
    const viewerContainer = document.getElementById('viewer');
    const screenDims = isMobile() ? { width: window.outerWidth, height: window.outerHeight } : { width: window.innerWidth, height: window.innerHeight };
    Object.assign(viewerContainer.style, { width: screenDims.width + 'px', height: screenDims.height + 'px' });
    var imageDimensions = await getImageDimensionsFromPropertiesXML("tiles/ImageProperties.xml");
    const annotations = await loadAnnotations();
    const overlays = loadOverlays(annotations, imageDimensions);
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
    addHandlers(viewer, imageDimensions);
    var toolbar = viewer.buttonGroup;
    toolbar.element.classList.add("toolbar");
    var customButton = new OpenSeadragon.Button({
        srcRest: "images/bars_rest.png",
        srcGroup: "images/bars_grouphover.png",
        srcHover: "images/bars_hover.png",
        srcDown: "images/bars_pressed.png",
        fadeLength: 100,
        tooltip: "Navigation",
        onPress: () => {toggleNav(toolbar.element)}
    });
    toolbar.buttons.unshift(customButton);
    toolbar.element.prepend(customButton.element);
    console.log(viewer);
});