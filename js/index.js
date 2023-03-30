import apikeys from '../api-keys.js';
var bodyTag = document.getElementById('bodyTag');
var actionDiv = document.getElementById('action');
var searchBox = document.getElementById('searchBox');
var searchButton = document.getElementById('searchButton');
var resultsDiv = document.getElementById('results');

var localStorageName = "osm-ai-map";
var initialLat = 51.45822;
var initialLng = -1.53595;
var initialZoom = 7;
var initialBearing = 0;
var initialPitch = 0;
var minZoomLevel = 6;


function updateURLHash() {
  var newHash = "";
  newHash = map.getCenter().lat.toFixed(5) + ",";
  newHash = newHash + map.getCenter().lng.toFixed(5) + ",";
  newHash = newHash + map.getZoom().toFixed(2) + ",";
  newHash = newHash + map.getBearing().toFixed(2) + ",";
  newHash = newHash + map.getPitch().toFixed(2) + "";

  location.hash = newHash;
  localStorage[localStorageName] = newHash;

}

var gotSomeLocationVariables = false; // did we find some well formed location varibales in the URL hash or localStorage?

var hashValues = location.hash.substring(1).split(",");
// check the URL hash values to see if it contains well-formed location info
if (hashValues.length == 5 && !hashValues.some(isNaN)) { // check if that location info looks valid; that there are 5 values and they are all numbers
    gotSomeLocationVariables = true;
} else if (localStorage[localStorageName]) {
    hashValues = localStorage[localStorageName].split(","); //check the browsers local storage to see if it contains any locaiton info
    if (hashValues.length == 5 && !hashValues.some(isNaN)) { // check if that location info looks valid; that there are 5 values and they are all numbers
        gotSomeLocationVariables = true;
    }
}

/* if we have some valid location info from the browsers URL or, failing that, the browsers localStorage cache, 
make the map use those settings (rather than the defaults) when it sets itself up */
if (gotSomeLocationVariables) {
    initialLat = parseFloat(hashValues[0]);
    initialLng = parseFloat(hashValues[1]);
    initialZoom = parseFloat(hashValues[2]);
    initialBearing = parseFloat(hashValues[3]);
    initialPitch = parseFloat(hashValues[4]);

} else {
    //they've not been here before, and not followed a URL that has valid location info embedded in it so let's show the help screen on startup
    
}




showMessagePermanently('Type something you want to find, like mountain bike routes, or medical facilites, or highways, or places to eat.');
  


function handleSearch() {
  var searchText = searchBox.value;
  bodyTag.classList.add("askingAI");
  askOpenAI(searchText);
}

searchButton.onclick = handleSearch;

searchBox.addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});


searchBox.onfocus = function(event) {
  if (map.getZoom() < 12){
    showMessagePermanently("Searching for map features might fail if you're zoomed out this far and search for something very common. Just saying.", "warning");
  }
};

resultsDiv.onclick = function(event) {
  resultsDiv.classList.add("expand");
};

document.onclick = function(event) {
  if (!resultsDiv.contains(event.target)) {
    resultsDiv.classList.remove("expand");
  }
};


  

function showMessage(actiontext, styleClass = "message"){
  //show a message briefly in the blue message box
  clearMessage();
  actionDiv.innerHTML = actiontext;
  actionDiv.classList.remove('show');
  actionDiv.classList.add(styleClass);
  actionDiv.classList.add('runActionAnimation');
  window.setTimeout(() => {
    actionDiv.classList.remove('runActionAnimation');
  
  }, 5000);
}

function showMessagePermanently(actiontext, styleClass = "message"){
  clearMessage();
  //show a message permanently in the blue message box
  actionDiv.innerHTML = actiontext;
  actionDiv.classList.add('show');
  actionDiv.classList.add(styleClass);
  
}

function clearMessage(){
  actionDiv.className = '';
}

function removeNewlines(str) {
  return str.replace(/\n/g, '');
}

function xhrSuccess(){
  bodyTag.classList.remove("askingAI");
  clearMessage();
  // this will recieve a URL to call OSM with
  var response = JSON.parse(this.responseText);
  //console.log("REPSONSE",response);
  var osmURL = response.choices[0].message.content;
  //it's not unusual to get newlines at the start and end of a reposne from a call to OpenAI. Let's make sure they are removed
  osmURL = removeNewlines(osmURL);
  osmURL = 'https://overpass-api.de/api/interpreter?' + osmURL;
  console.log("API CALL",osmURL);
  showMessagePermanently("Requesting data from OpenStreetMap...");
  final_span.innerHTML = osmURL;
  fetch(osmURL)
  .then(response => {
        return response.text();
    })
  .then(data => {
    data = JSON.parse(data);
    console.log("OSM DATA", data);
    
    
    var geojson = osmtogeojson(data);

    console.log("GEOJSON",geojson);
    showMessage("Found " + geojson.features.length + " features")

    var sourceId = 'ai-results';

    
    if (map.getSource(sourceId)) {
        map.removeLayer('points');
        map.removeLayer('outlines');
        map.removeLayer('fills');
        map.removeSource(sourceId);
        
        console.log('Source removed!');
    } else {
        //console.log('Source does not exist!');
    }
    map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
    });

    map.addLayer({
      'filter': [
        "all",
        [
          "==",
          ["geometry-type"],
          "Point"
        ]
      ],
        'id': 'points',
        'type': 'circle',
        'source': sourceId,
        'paint': {
        'circle-radius': 8,
        'circle-stroke-width': 4,
        'circle-color': 'red',
        'circle-stroke-color': 'white'
        }
    });
    map.addLayer({
      'filter': [
        "all",
        [
          "==",
          ["geometry-type"],
          "Polygon"
        ]
      ],
        'id': 'fills',
        'type': 'fill',
        'source': sourceId, // reference the data source
        'layout': {},
        'paint': {
        'fill-color': '#ff0000', // red color fill
        'fill-opacity': 0.5,
        }
        });
    map.addLayer({
      'filter': [
        "all",
        [
          "==",
          ["geometry-type"],
          "LineString"
        ]
      ],
        'id': 'outlines',
        'type': 'line',
        'source': sourceId,
        'layout': {},
        'paint': {
        'line-color': '#ff0000',
        'line-width': 6,
        }
        });

  })
  .catch(error => showMessagePermanently("AI made an invalid call to OpenStreetMap: " + error, "warning"));

}

function askOpenAI(searchText){

        showMessagePermanently('Asking OpenAI to find things related to "' + searchText +  '" in OpenStreetMap. This can take a while... <img class="loader" src="img/grid.svg">');
        var bounds = map.getBounds();

        // Write the bounding box coordinates of the current view into a string to later use in the AI Prompt
        var location = "" + bounds.getSouthWest().lat + "," + bounds.getSouthWest().lng + "," + bounds.getNorthEast().lat + "," + bounds.getNorthEast().lng + "";

        var openAIPrompt = 'Write me a data query for Open Streetmap that returns common features known to exist in the OpenStreetMap database that are related to the term "' + searchText + '" within this bounding-box ' + location + ' .\n'
        + 'Respond with just the "data" part of the querystring on a single line and no explanation.'
        + 'Format your response like this: data=[out:json][timeout:25];{INSERT_QUERY_HERE};out;>;out skel qt;'
        ;
        console.log("Asking OpenAI: " + openAIPrompt);
        
        var xhr = new XMLHttpRequest();
        xhr.onload = xhrSuccess;
        var url = 'https://api.openai.com/v1/chat/completions';
        
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + apikeys.openAPIKey);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        
        var data = JSON.stringify({
          'model': 'gpt-4',
          'temperature': 0,
          'max_tokens': 1000,
          'messages': [{'role': 'user', 'content': openAIPrompt}]
        });
  
        xhr.send(data);

}


var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=' + apikeys.maptilerAPIKey, // stylesheet location
  center: [initialLng, initialLat], // starting position [lng, lat]
  zoom: initialZoom, // starting zoom
  pitch: initialPitch,
  bearing: initialBearing
});

map.on('load', function () {
  updateURLHash();
});

map.on('moveend', function () {
  updateURLHash();
});


