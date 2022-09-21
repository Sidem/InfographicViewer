window.addEventListener('load', async () => {
    loadLangs();
    if (localStorage.getItem("lang") === null) localStorage.setItem("lang", "en");
    var imageDimensions = await getImageDimensionsFromPropertiesXML("tiles_" + localStorage.getItem("lang") + "/ImageProperties.xml");
    var viewer = OpenSeadragon({
        id: "viewer",
        prefixUrl: "images/",
        tileSources: [{
            type: "zoomifytileservice",
            width: imageDimensions.width,
            height: imageDimensions.height,
            tilesUrl: "tiles_" + localStorage.getItem("lang") + "/",
            tileSize: 256,
            fileFormat: 'jpg'
        }],
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        sequenceControlAnchor: 'TOP_RIGHT',
        autoHideControls: false
    });
    let annotations = await loadAnnotations();
    addOverlays(annotations, imageDimensions, viewer);
    addHandlers(viewer);
    initSidebarButton(viewer);
    document.getElementById('language').value = localStorage.getItem("lang");
    document.getElementById('language').onchange = async (e) => {
        let prev = localStorage.getItem("lang");
        localStorage.setItem("lang", e.target.value);
        if (prev != e.target.value) {
            await changeImage(viewer);
            await reloadOverlays(imageDimensions, viewer);
        }
    };
});