// Street Map with api_key reference 
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.mapbox-streets-v8",
    accessToken: API_KEY
});
// Terrain Map with api_key reference 
var terrainmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.mapbox-terrain-v2",
    accessToken: API_KEY
});
// Satellite Map with api_key reference 
var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: API_KEY
});

let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});


// Create our map, giving it the sattelite and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 5,
    layers: [streets]
});

// Base Map to hold all other maps
var baseMaps = {
    "Street Map": streets,
    "Terrain Map": terrainmap,
    "Sattelite": satellite
};

let earthquakes = new L.LayerGroup();

let tectonicplates = new L.LayerGroup();


// Layering overlayMaps
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicplates

};

// Adding layer control to Maps then 2pass in baseMaps and overlayMaps
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    console.log("data")
    console.log(data)

    function markerSize(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 3;
    }
    // Function for Magnitude of the Earthquake
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: chooseColor(feature.properties.mag),
            color: "#000000",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    // Function for color of Magnitude of the Earthquake
    function chooseColor(magnitude) {
        switch (true) {
            case magnitude > 5:
                return "#581845";
            case magnitude > 4:
                return "#900C3F";
            case magnitude > 3:
                return "#C70039";
            case magnitude > 2:
                return "#FF5733";
            case magnitude > 1:
                return "#FFC300";
            default:
                return "#DAF7A6";
        }
    }
    // Create a GeoJSON Layer 
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place +
                "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) +
                "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
        
    }).addTo(earthquakes);
    // Add earthquakes to the Map
    earthquakes.addTo(myMap);


    let legend = L.control({
        position: "bottomright"
    });


    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
            "#DAF7A6",
            "#FFC300",
            "#FF5733",
            "#C70039",
            "#900C3F",
            "#581845"
        ];


        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(myMap);


    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
        // Adding our geoJSON data, along with style information, to the tectonicplates
        // layer.
        L.geoJson(platedata, {
            color: "#ff6500",
            weight: 2
        })
            .addTo(tectonicplates);

        // Then add the tectonicplates layer to the map.
        tectonicplates.addTo(myMap);
    });




});



