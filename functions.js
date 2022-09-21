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
    return { width: parseInt(image_properties.getAttribute('WIDTH')), height: parseInt(image_properties.getAttribute('HEIGHT')) };
}
function loadAnnotationData(id) {
    var annotationData = JSON.parse(window.localStorage.getItem(id));
    var title = document.getElementById('annotation-title');
    var body = document.getElementById('annotation-content');
    title.innerText = annotationData.title;
    body.innerHTML = annotationData.body;
}

async function loadAnnotations() {
    let annotationFile = "annotations_" + localStorage.getItem("lang") + ".json";
    const response = await fetch(annotationFile);
    var data = await response.text();
    data = JSON.parse(data).annotations;
    for (var i = 0; i < data.length; i++) {
        window.localStorage.setItem("annotation-" + i, JSON.stringify(data[i]));
    }
    return data;
}

function addOverlays(annotations, imageDimensions, viewer) {
    var overlays = [];
    const imageRatio = imageDimensions.width / imageDimensions.height;
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        let annotationElement = document.createElement("a");
        annotationElement.id = "annotation-" + i
        annotationElement.classList.add("annotation");
        if (annotation.type == 'link') {
            annotationElement.classList.add("annotation-link");
            annotationElement.href = annotation.link;
            annotationElement.target = "_blank";
            //annotationElement.innerText = annotation.title;
        }
        viewer.addOverlay(
            annotationElement,
            new OpenSeadragon.Rect(
                (annotation.x / imageDimensions.width) - (overlaySize / 2),
                (annotation.y / (imageDimensions.height * imageRatio)) - (overlaySize / 2),
                overlaySize,
                overlaySize)
        );
    }
    return overlays;
}

function getAnnotationString(x, y, title, content) {
    var annotationString = "";
    annotationString += "{\n";
    annotationString += "\t\"x\": " + x + ",\n";
    annotationString += "\t\"y\": " + y + ",\n";
    annotationString += "\t\"type\": \"info\",\n";
    annotationString += "\t\"title\": \"" + title + "\",\n";
    annotationString += "\t\"body\": \"" + content + "\"\n";
    annotationString += "},\n";
    return annotationString;
}

function getCoordString(x,y) {
    var annotationString = "";
    annotationString += "\"x\": " + x + ",\n";
    annotationString += "\"y\": " + y + ",\n";
    return annotationString;
}

function addHandlers(viewer) {
    viewer.addHandler('full-screen', (e) => {
        let sidebarToggleButton = document.getElementById("sidebar-toggle-button");
        sidebarToggleButton.style.display = (e.fullScreen) ? "none" : "inline-block";
    });
    viewer.addHandler('canvas-click', function (event) {
        var clickedAnnotation = event.originalTarget;
        var isAnnotation = clickedAnnotation.classList.contains("annotation");
        var isLink = clickedAnnotation.classList.contains("annotation-link");
        var annotationVisible = document.getElementById('annotation-toggle').checked;

        if (isAnnotation) {
            if (isLink) {
                if (confirm("You are about to open a new tab to:\n" + clickedAnnotation.href + "\nAre you sure?"))
                    window.open(clickedAnnotation.href, '_blank').focus();
            } else {
                loadAnnotationData(clickedAnnotation.id);
                toggleAnnotation(true);
            }
            event.preventDefaultAction = true;
        } else if (annotationVisible) {
            toggleAnnotation(false);
            event.preventDefaultAction = true;
        }
        var webPoint = event.position;
        var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
        var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
        if (window.event.ctrlKey && !window.event.shiftKey) {
            navigator.clipboard.writeText(getCoordString(parseInt(imagePoint.x), parseInt(imagePoint.y)));
            event.preventDefaultAction = true;
        }
        if (window.event.ctrlKey && window.event.shiftKey) {
            navigator.clipboard.writeText(getAnnotationString(parseInt(imagePoint.x), parseInt(imagePoint.y), "title", "html-content"));
            event.preventDefaultAction = true;
        }
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
        onPress: () => { toggleNav(toolbar.element) }
    });
    toolbar.buttons.unshift(sidebarToggleButton);
    sidebarToggleButton.element.id = "sidebar-toggle-button";
    toolbar.element.prepend(sidebarToggleButton.element);
}

async function changeImage(viewer) {
    let lang = localStorage.getItem("lang");
    var imageDimensions = await getImageDimensionsFromPropertiesXML("tiles_" + lang + "/ImageProperties.xml");
    viewer.open({
        type: "zoomifytileservice",
        width: imageDimensions.width,
        height: imageDimensions.height,
        tilesUrl: "tiles_" + lang + "/",
        tileSize: 256,
        fileFormat: 'jpg'
    });
}

async function reloadOverlays(imageDimensions, viewer) {
    viewer.clearOverlays();
    let annotations = await loadAnnotations();
    addOverlays(annotations, imageDimensions, viewer);
}

function loadLangs() {
    let langSelector = document.getElementById("language");
    for (let lang of langs) {
        let item = document.createElement("option");
        item.value = lang.code;
        item.innerHTML = lang.name;
        langSelector.appendChild(item);
    }
}