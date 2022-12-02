window.addEventListener('load', async () => {
    loadLangs();
    const urlParams = new URLSearchParams(window.location.search);
    if (localStorage.getItem("lang") === null) {
        localStorage.setItem("lang", "en");
    }
    if (urlParams.has('lang')) localStorage.setItem("lang", urlParams.get('lang'));
    if (urlParams.has('debug')) localStorage.setItem("testenv", 1); 
    else localStorage.setItem("testenv", 0);
    
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
    if (localStorage.getItem("testenv") == 1)
        initAnnotationDebugger(imageDimensions, viewer);
        
    var data = await getAnnotationDataFromLangFile();
    let annotations = await loadAnnotationDataIntoStorage(data);
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
                var data = await getAnnotationDataFromLangFile();
                await reloadOverlays(imageDimensions, viewer, data);
            }
        };
    }
});