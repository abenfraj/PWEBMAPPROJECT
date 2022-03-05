window.onload = function init() {
  var northWest = L.latLng(90, -180);
  var southEast = L.latLng(-90, 180);
  var bornes = L.latLngBounds(northWest, southEast);

  // Initialisation de la couche StamenWatercolor
  var coucheStamenWatercolor = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      ext: "jpg",
    }
  );
  // Initialisation de la carte et association avec la div
  var map = new L.Map("maDiv", {
    center: [48.858376, 2.294442],
    minZoom: 1.5,
    maxZoom: 5,
    zoom: 5,
    maxBounds: bornes,
  });

  // bornes pour empecher la carte StamenWatercolor de "dériver" trop loin...

  //var map = L.map('maDiv').setView([48.858376, 2.294442],5);
  // Affichage de la carte
  map.addLayer(coucheStamenWatercolor);
  // Juste pour changer la forme du curseur par défaut de la souris
  document.getElementById("maDiv").style.cursor = "crosshair";
  //map.fitBounds(bornes);

  var boundaries;
  $.ajax({
    url: "http://localhost/PWEBMAPPROJECT/countries.geo.json",
    dataType: "json",
    type: "GET",
    async: false,
    success: function (response) {
      boundaries = response;
      console.log(response);
    },
  });

  var numberOfCountries;

  // Initilisation d'un popup
  var popup = L.popup();

  // Fonction de conversion au format GeoJSON

  var newMarker;
  var distance;

  // Association Evenement/Fonction handler
  map.on("click", function onMapClick(e) {
    newMarker = new L.marker(e.latlng).addTo(map);
    console.log(e.latlng);
    console.log(getDistanceFromLatLonInKm(e.latlng.lat, e.latlng.lng, 0, 0));
    // popup
    //   .setLatLng(e.latlng)
    //   .setContent(
    //     "Hello click détecté sur la carte !<br/> " +
    //       e.latlng.toString() +
    //       "<br/>en GeoJSON: " +
    //       coordGeoJSON(e.latlng, 7) +
    //       "<br/>Niveau de  Zoom: " +
    //       map.getZoom().toString()
    //   )
    //   .openOn(map);
  });
  L.geoJSON(boundaries).addTo(map);

  var playBtn = document.getElementById("playBtn");
  playBtn.onclick = function () {
    var randomCapitals = [];
    while (randomCapitals.length < 10) {
      var r = Math.floor(Math.random() * 247) + 1;
      if (randomCapitals.indexOf(r) === -1) randomCapitals.push(r);
    }
    console.log(randomCapitals);
    progress(30, 30, $("#progressBar"));
    
    $.ajax({
        url: "http://localhost/PWEBMAPPROJECT/countries.json",
        dataType: "json",
        type: "GET",
        async: false,
        success: function (response) {
          numberOfCountries = response.length;
          randomCapitals.forEach((capitalNumber) => {
            console.log(response[capitalNumber].name);
            new L.marker([
              response[capitalNumber].latlng[0],
              response[capitalNumber].latlng[1],
            ]).addTo(map);
          });
          console.log(numberOfCountries);
        },
      });
  };
  
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function coordGeoJSON(latlng, precision) {
  return (
    "[" +
    L.Util.formatNum(latlng.lng, precision) +
    "," +
    L.Util.formatNum(latlng.lat, precision) +
    "]"
  );
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

// Fonction qui réagit au clic sur la carte (e contiendra les données liées au clic)

function progress(timeleft, timetotal, $element) {
  var progressBarWidth = (timeleft * $element.width()) / timetotal;
  $element
    .find("div.bar")
    .animate(
      { width: progressBarWidth },
      timeleft == timetotal ? 0 : 1000,
      "linear"
    );
  if (timeleft > 0) {
    setTimeout(function () {
      progress(timeleft - 1, timetotal, $element);
    }, 1000);
  }
  var date = new Date(null);
  date.setSeconds(timeleft);
  var timeString = date.toISOString().substr(11, 8);
  var newtimeleft = timeString;

  $("#timer").text(newtimeleft);
}
