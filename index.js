var alreadyPlayed;
var didNotPlay;
var numberOfTimesPlayed;
var score;
var numberOfTimesToPlay;
var time;
var map;
var boundaries;
var northWest;
var southEast;
var bornes;
var scoreText;
var pays;
var isPlaying;
var playBtn;
var capitalToGuess;
var currentTry;
var randomCapitals;
var didNotPlayInterval;
var newMarker;
var greenIcon;
var answerMarker;
var ligne;
var distance;
var firstGame = true;
window.addEventListener("load", init);

function init() {
  alreadyPlayed = false;
  didNotPlay = false;

  numberOfTimesPlayed = 0;
  score = 0;
  numberOfTimesToPlay = 2;
  time = 15;
  capitalToGuess = $("#capitalToGuess");
  playBtn = document.getElementById("playBtn");
  isPlaying = false;
  pays = [];
  scoreText = $("#score");
  if (firstGame) {
    initMap();
    playBtn.addEventListener("click", playGame);
    firstGame = false;
  } else {
    
    playGame();
  }


};

function initMap() {
  northWest = L.latLng(90, -180);
  southEast = L.latLng(-90, 180);
  bornes = L.latLngBounds(northWest, southEast);
  var coucheStamenWatercolor = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      ext: "jpg",
    }
  );
  map = new L.Map("maDiv", {
    center: [48.858376, 2.294442],
    minZoom: 1.2,
    maxZoom: 5,
    zoom: 1.2,
    maxBounds: bornes,
  });

  map.addLayer(coucheStamenWatercolor);

  document.getElementById("maDiv").style.cursor = "crosshair";
  requestBoundaries();


  L.geoJSON(boundaries).addTo(map);
}

function requestBoundaries() {
  $.ajax({
    url: "http://localhost:50000/countries.geo.json",
    dataType: "json",
    type: "GET",
    async: false,
    success: function (response) {
      boundaries = response;
      console.log(response);
    },
  });
}


function playGame() {
  $(this).hide();
  map.addEventListener("click", onMapClick)
  currentTry = 0;
  if (!isPlaying) {
    isPlaying = true;
    requestRandomCapitals();
    console.log(randomCapitals);
    progress(time, time, $("#progressBar"));
    showCapitalToGuess();
    didNotPlayInterval = setInterval(function () {
      if (didNotPlay) {
        numberOfTimesPlayed++;
        if (numberOfTimesPlayed < numberOfTimesToPlay) {
          progress(time, time, $("#progressBar"));
          showCapitalToGuess();
        } else {
          clearInterval(didNotPlayInterval);
          endGame();
          // TODO: A CHANGER POUR QUE LA PARTIE SE RELANCE
        }
      }
    }, 17500);

    greenIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Association Evenement/Fonction handler pour afficher la réponse
    map.on("click", onMapClick);

  }
}

function onMapClick(e) {
  if (!alreadyPlayed && isPlaying) {
    didNotPlay = false;
    $("#progressBar").find("div.bar").stop();
    numberOfTimesPlayed++;
    newMarker = new L.marker(e.latlng).addTo(map);
    alreadyPlayed = true;
    console.log(e.latlng);
    console.log(
      pays[randomCapitals[currentTry - 1]].name +
      ", " +
      pays[randomCapitals[currentTry - 1]].latlng[0] +
      ", " +
      pays[randomCapitals[currentTry - 1]].latlng[1]
    );
    console.log(
      getDistanceFromLatLonInKm(
        e.latlng.lat,
        e.latlng.lng,
        pays[randomCapitals[currentTry - 1]].latlng[0],
        pays[randomCapitals[currentTry - 1]].latlng[1]
      )
    );
    answerMarker = new L.marker(
      [
        pays[randomCapitals[currentTry - 1]].latlng[0],
        pays[randomCapitals[currentTry - 1]].latlng[1],
      ],
      { icon: greenIcon }
    ).addTo(map);
    ligne = L.polyline(
      [
        [e.latlng.lat, e.latlng.lng],
        [
          pays[randomCapitals[currentTry - 1]].latlng[0],
          pays[randomCapitals[currentTry - 1]].latlng[1],
        ],
      ],
      { color: "black", weight: 4 }
    ).addTo(map);
    distance = getDistanceFromLatLonInKm(
      e.latlng.lat,
      e.latlng.lng,
      pays[randomCapitals[currentTry - 1]].latlng[0],
      pays[randomCapitals[currentTry - 1]].latlng[1]
    );
    score = parseInt(scoreText.text()) + distance;
    scoreText.html(Math.round(score));
    capitalToGuess.html(
      "Vous avez cliqué à " + parseInt(distance) + "km du bon endroit !"
    );
    if (numberOfTimesPlayed < numberOfTimesToPlay) {
      setTimeout(function () {
        ligne.remove();
        newMarker.remove();
        answerMarker.remove();
        console.log(time);
        alreadyPlayed = false;
        progress(time, time, $("#progressBar"));
        showCapitalToGuess();
      }, 3000);
    } else {
      setTimeout(function () {
        endGame();
        if (!didNotPlay) {
          ligne.remove();
          newMarker.remove();
          answerMarker.remove();
        }
        isPlaying = false;
      }, 3000);
    }
  }
}



function requestRandomCapitals() {
  randomCapitals = [];
  while (randomCapitals.length < 10) {
    var r = Math.floor(Math.random() * 242) + 1;
    if (randomCapitals.indexOf(r) === -1) randomCapitals.push(r);
  }
  $.ajax({
    url: "http://localhost:50000/countries.json",
    dataType: "json",
    type: "GET",
    async: false,
    success: function (response) {
      pays = response;
      randomCapitals.forEach((capitalNumber) => {
        console.log(pays[capitalNumber].name);
      });
    },
  });
}


function calculerScore() {
  return score;
}

function initPays() { }

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
  if (timeleft > -1) {
    const progressTimeoutId = setTimeout(function () {
      progress(timeleft - 1, timetotal, $element);
    }, 1000);
    if (alreadyPlayed) {
      $element.find("div.bar").stop();
      clearTimeout(progressTimeoutId);
    }
  } else {
    document.getElementById("capitalToGuess").innerHTML = "Temps écoulé !";
    console.log("Temps écoulé !");
    didNotPlay = true;
  }
  var date = new Date(null);
  date.setSeconds(timeleft);
}

function showCapitalToGuess() {
  capitalToGuess.html(
    "Pays: " +
    pays[randomCapitals[currentTry]].name +
    "<br> Capitale: " +
    pays[randomCapitals[currentTry++]].capital
  );
}

function rejouer() {
  $("#playBtn").hide();
  playBtn.removeEventListener("click", rejouer);
  init();
}


function endGame() {
  playBtn.removeEventListener("click", playGame);
  isPlaying = false;
  //addeventlister du bouton playBtn pour rejouer
  $("#playBtn").show();
  $("#capitalToGuess").html(
    "Partie terminée ! <br> Score final : " + parseInt(score)
  );
  $("#playBtn").html("Rejouer");
  playBtn.addEventListener("click", rejouer);
}

// $.ajax({
//   url: "http://localhost/PWEBMAPPROJECT/countries.json",
//   dataType: "json",
//   type: "GET",
//   async: false,
//   success: function (response) {
//     pays = response;
//     randomCapitals.forEach((capitalNumber) => {
//       console.log(pays[capitalNumber].name);
//       new L.marker([
//         pays[capitalNumber].latlng[0],
//         pays[capitalNumber].latlng[1],
//       ]).addTo(map);
//     });
//   },
// });

// https://prod.liveshare.vsengsaas.visualstudio.com/join?D50CBC17FE9CC1CEE5D7BBDE8AFA94DAD1AD