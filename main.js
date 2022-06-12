const overlaySize = 0.018;
const sidebarWidth = "300px";
function toggleNav(container) {
    var newSize = (document.getElementById("sidebar").style.width != sidebarWidth) ? sidebarWidth : "0px";
    document.getElementById("sidebar").style.width = newSize;
    container.style.marginLeft = newSize;
}

function toggleAnnotation(on) {
    var annotation = document.getElementById('annotation-toggle');
    annotation.checked = (on) ? true : !annotation.checked;
}

async function getImageDimensionsFromPropertiesXML(propertiesFile) { 
    const response = await fetch(propertiesFile);
    const data = await response.text();
    const image_properties = (new DOMParser()).parseFromString(data, 'text/xml').getElementsByTagName("IMAGE_PROPERTIES")[0];
    return {width:parseInt(image_properties.getAttribute('WIDTH')), height:parseInt(image_properties.getAttribute('HEIGHT'))};
}
function loadAnnotationData(id) {
    var annotationData = JSON.parse(window.localStorage.getItem(id));
    var title = document.getElementById('annotation-title');
    var body = document.getElementById('annotation-content');
    title.innerText = annotationData.title;
    body.innerHTML = annotationData.body;

}

async function loadAnnotations() {
    const response = await fetch("annotations.json");
    var data = await response.text();
    data = JSON.parse(data).annotations;
    for(var i = 0; i < data.length; i++) {
        window.localStorage.setItem("annotation-"+i, JSON.stringify(data[i]));
    }
    return data;
}

function addOverlays(annotations, imageDimensions, viewer) {
    var overlays = [];
    const imageRatio = imageDimensions.width / imageDimensions.height;
    for(var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        let annotationElement = document.createElement("a");
        annotationElement.id = "annotation-"+i
        annotationElement.classList.add("annotation");
        if(annotation.type == 'link') {
            annotationElement.classList.add("annotation-link");
            annotationElement.href = annotation.link;
            annotationElement.target = "_blank";
            //annotationElement.innerText = annotation.title;
        }
        viewer.addOverlay(
            annotationElement, 
            new OpenSeadragon.Rect(
                (annotation.x/imageDimensions.width)-(overlaySize/2), 
                (annotation.y/(imageDimensions.height*imageRatio))-(overlaySize/2), 
            overlaySize, 
            overlaySize)
        );
    }
    return overlays;
}

function addHandlers(viewer, imageDimensions) {
    viewer.addHandler('full-screen', (e) => {
        let sidebarToggleButton = document.getElementById("sidebar-toggle-button");
        sidebarToggleButton.style.display = (e.fullScreen) ? "none" : "inline-block";
    });
    viewer.addHandler('canvas-click', function(event) {
        var clickedAnnotation = event.originalTarget;
        var isAnnotation = clickedAnnotation.classList.contains("annotation");
        var isLink = clickedAnnotation.classList.contains("annotation-link");
        if (isAnnotation) {
            if(isLink) {
                if(confirm("You are about to open a new tab to:\n"+clickedAnnotation.href+"\nAre you sure?")) 
                window.open(clickedAnnotation.href, '_blank').focus();
            } else {
                loadAnnotationData(clickedAnnotation.id);
                toggleAnnotation(true);
            }
            event.preventDefaultAction = true;
        }
        var webPoint = event.position;
        var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
        var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
        console.log(imagePoint.toString(), viewportPoint.toString(), imagePoint.x/imageDimensions.width, imagePoint.y/imageDimensions.width);
    });
}

function initSidebarButton(viewer) {
    var toolbar = viewer.buttonGroup;
    toolbar.element.classList.add("toolbar");
    var sidebarToggleButton = new OpenSeadragon.Button({
        srcRest: "images/bars_rest.png",
        srcGroup: "images/bars_grouphover.png",
        srcHover: "images/bars_hover.png",
        srcDown: "images/bars_pressed.png",
        fadeLength: 100,
        tooltip: "Navigation",
        onPress: () => {toggleNav(toolbar.element)}
    });
    toolbar.buttons.unshift(sidebarToggleButton);
    sidebarToggleButton.element.id = "sidebar-toggle-button";
    toolbar.element.prepend(sidebarToggleButton.element);
}

window.addEventListener('load', async () => {
    var imageDimensions = await getImageDimensionsFromPropertiesXML("tiles/ImageProperties.xml");
    var viewer = OpenSeadragon({
        id: "viewer",
        prefixUrl: "images/",
        tileSources: [{
            type:       "zoomifytileservice",
            width:      imageDimensions.width,
            height:     imageDimensions.height,
            tilesUrl:   "tiles/",
            tileSize: 256,
            fileFormat: 'jpg'	
        }],
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        sequenceControlAnchor: 'TOP_RIGHT',
        autoHideControls: false
    });
    const annotations = await loadAnnotations();
    addOverlays(annotations, imageDimensions, viewer);
    addHandlers(viewer, imageDimensions);
    initSidebarButton(viewer)
});