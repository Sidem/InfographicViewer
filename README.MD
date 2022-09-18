[OpenSeaDragon License](https://openseadragon.github.io/license/)

<h1>Maintenance instructions</h1>

<h2>Annotations</h2>
All annotations are dynamically loaded from their language specific annotations files formatted "annotations_[lang].json".
for the abbreviation of the language we use <a href="https://en.wikipedia.org/wiki/ISO_639-1">ISO 639-1</a>
For english annotations see: <a href="https://github.com/Sidem/InfographicViewer/blob/master/annotations_en.json">annotations_en.json</a></br>
Annotations have the following attributes:

<ul>
<li>x: The x coordinate of the annotations location</li>
<li>y: The y coordinate of the annotations location</li>
<li>type: The type of the annotation (options: "info", "link")</li>
<li>title: Title of the annotation (only applies for type "info")</li>
<li>body: Content for the annotation. Can contain any HTML (only applies for type "info")</li>
<li>link: URL to which the link annotation points (only applies for type "link")</li>
</ul>
<strong>
TIP: To quickly get the coordinates of a point on the infographic hold ctrl and click. This will put an annotation snippet with the clicked coordinates into your clipboard ready to be pasted into the annotation file.</strong>

<h2>Adding another language</h2>
To add another language you need to do three things:
<ul>
<li>Add its language specific tiles folder</li>
<li>Add its language specific annotations file</li>
<li>Add the language to the <a href="https://github.com/Sidem/InfographicViewer/blob/master/config.js">config.js</a> file</li>
</ul>
<h2>Converting image to tiles</h2>
<a href="http://www.zoomify.com/free.htm">Zoomify</a> allows you to quickly and easily turn a large image into a set of tiles, for alternative tools see: <a href="http://openseadragon.github.io/">openseadragon.github.io</a>.
The code is currently only tested to work with a Zoomify tile source.