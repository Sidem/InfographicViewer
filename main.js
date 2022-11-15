window.addEventListener('load', async () => {
    loadLangs();
    const urlParams = new URLSearchParams(window.location.search);
    if (localStorage.getItem("lang") === null) {
        localStorage.setItem("lang", "en");
    }
    if (urlParams.has('lang')) localStorage.setItem("lang", urlParams.get('lang'));
    
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
    for (let item of document.getElementsByClassName('language-item')) {
        item.onclick = async (e) => {
            e.preventDefault();
            let prev = localStorage.getItem("lang");
            localStorage.setItem("lang", e.target.ariaValueText);
            if (prev != e.target.ariaValueText) {
                await changeImage(viewer);
                await reloadOverlays(imageDimensions, viewer);
            }
        };
    }
});