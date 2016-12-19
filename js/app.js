// Neighborhood Map project
// Main JavaScript
// Author: Greg Ford, B.Sc.
// Start Date: Dec. 13, 2016

//
// GLOBALS
//
var view_model;
// Google Map object
var map_global;
// ******************
// Map Styles
// Create styles to use on the map
//  Find Option list here: https://developers.google.com/maps/documentation/javascript/style-reference
var mapStyles = [
  {
    featureType: 'water',
    stylers: [
      // {color: '#474CB2'}
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      // {color: '#141A8E'},
      {weight: 2}
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      // {color: '#CD7200'}
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      // {color: '#7D4600'},
      {lightness: -40}
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      // {color: '#FFD04C'},
      {lightness: -40}
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      {weight: 9},
      {hue: '#262CAD'}
    ]
  },{
    featureType: 'transit.station',
    elementType: 'labels.icon',
    stylers: [
      {visibility: 'on'}
    ]
  },{
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers:[
      // {color: '#FFD04C'},
      {lightness: 20}
    ]
  },{
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers:[
      // {color: '#7D4600'},
      // {lightness: -40}
    ]
  }
]
// ******************
// Favorite locations
var favSpots = [{
  name: 'Oliver Street Bar and Grill',
  type: 'Pub',
  address: '23 Oliver St, Williams Lake, BC',
  geoLocation: '',
  reviews: [],
  imgSrc: '',
  imgAttribution: ''
},{
  name: 'Mings Palace',
  type: 'Restaurant',
  address: '12 Oliver Street, Williams Lake, BC',
  geoLocation: '',
  reviews: [],
  imgSrc: '',
  imgAttribution: ''
},{
  name: 'Bean Counter Bistro & Coffee Bar',
  type: 'Bistro',
  address: 'Suite B 180 3rd Ave N, Williams Lake, BC',
  geoLocation: '',
  reviews: [],
  imgSrc: '',
  imgAttribution: ''
},{
  name: 'Overlander Pub',
  type: 'Pub',
  address: '1118 Lakeview Crescent, Williams Lake, BC',
  geoLocation: '',
  reviews: [],
  imgSrc: '',
  imgAttribution: ''
},{
  name: 'The Laughing Loon',
  type: 'Pub',
  address: '1730 Broadway Ave S, Williams Lake, BC',
  geoLocation: '',
  reviews: [],
  imgSrc: '',
  imgAttribution: ''
}]
//*******************
//
var CoolSpot = function(data){
  var self = this;
  //
  this.name = ko.observable(data.name);
  //
  this.address = ko.observable(data.address);
  //
  this.type = ko.observable(data.type);
  //
  this.geoLocation = ko.observable(data.geoLocation);
  //
  this.markerColor = ko.observable('070B57');
  //
  this.imgSrc = ko.observable(data.imgSrc);
  //
  this.imgAttribution = ko.observable(data.imgAttribution);
  //
  this.reviews = ko.observableArray(data.reviews);
  // TODO: Add computed observables; get more information about this spot, map marker, etc.
  // Map marker for this object
  this.marker = ko.observable(null);
}
//*******************
var ViewModel = function(){
  // Use for clarity when necessary
  var self = this;

  // Global variable to collect drawing data
  var polygon = null;
  // Provide global access to this as an object literal
  view_model = this;
  // ***************************
  // List of favorites locations
  this.spotList = ko.observableArray([]);
  // Load the favorite location list with static data
  favSpots.forEach(function(location){
    self.spotList.push(new CoolSpot(location));
  });
  // Set the Current cool spot
  this.currentSpot = ko.observable(this.spotList()[0]);
  // *********************
  // Set up slideout menu
  var slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': 10,
    'tolerance': 70,
    'duration': 350,
    'easing':'ease-out(.32,2,.55,.27)'
  });
  // Toggle button
  this.menuToggle = function(){
    slideout.toggle();
  };
  //************************
  // GOOGLE MAP STUFF
  // Initialize google map
  this.initMap = function(map){
    // lat/long literal for a map and map marker.
    var williams_lake = {lat: 52.1417, lng: -122.1417};
    // Constructor that creates a new map - only center and zoom are required
    //  The first parameter is the element on the page to place the map,
    map = new google.maps.Map(document.getElementById('map'),{
      // Set initial location to Williams Lake
      center: williams_lake,
      // Zoom can go up to 21.
      zoom: 13,
      // Set the styles property to use the above array
      styles: mapStyles
    });
    // Set the new map to the Global map variable
    map_global = map;
    // Set up the lat/long literal for a map marker.
    var williams_lake = {lat: 52.1417, lng: -122.1417};
    // Set the marker with the position and the map object created above.
    var marker = new google.maps.Marker({
      position: williams_lake,
      map: map_global,
      title: 'Center of Williams Lake'
    });
    // set up markers for the cool spots
    self.spotList().forEach(function(spot){
      // console.log("Spot List, Address: "+spot.address());
      // createMarker(spot.name(),spot.address());
      buildMarker(spot);
    });
    // Testing
    // createMarker("Test","12 Oliver Street, Williams Lake, BC");


  };
  // *************************************
  // Called to show cool spot markers
  this.showSpots = function(){
    console.log("Show Spots");
    var mapBounds = new google.maps.LatLngBounds();
    // Go through the cool spot list and set the map for
    //  each marker
    this.spotList().forEach(function(spot){
      spot.marker().setMap(map_global);
      // Extend the boundry for the marker if necessary
      mapBounds.extend(spot.marker().position);
    });
    // Set the center of the map by getting the center of
    //  all of the cool spot list markers
    map_global.setCenter(mapBounds.getCenter());
    // Set the bounds of the map by the marker postions
    map_global.fitBounds(mapBounds);
  };
  //************************
  // Called to hide cool spots
  this.hideSpots = function(){
    console.log("Hide Spots");
    this.spotList().forEach(function(spot){
      console.log("Set Map");
      spot.marker().setMap(null);
    });
  };
}

ko.applyBindings(new ViewModel());

// Build a map marker for the targetted cool spot
function buildMarker(targetSpot){
  console.log("Test Spot Name "+targetSpot.name());
  // Initialize a geocoder
  var geocoder = new google.maps.Geocoder();
  // Make sure the address isn't blank
  if(targetSpot.address() == ''){
    window.alert('Address: '+targetSpot.address()+', is not valid.');
  }else {
      console.log("--Test getGeocode Address "+targetSpot.address());
    // Geocode the address/area entered; want the center.
    geocoder.geocode(
      { address: targetSpot.address() }// keep within city
      , function(results, status){
        console.log("----Status: "+status);
        // Center the map on location if an address or area is found
        if(status == google.maps.GeocoderStatus.OK){
          //
          targetSpot.geoLocation(results[0].geometry.location);
          // Create marker
          var marker = new google.maps.Marker({
            // map: map_global,
            position: targetSpot.geoLocation(),// Location of marker on map
            title: targetSpot.name(),// What will show when the marker is hovered over
            icon: makeMarkerIcon(targetSpot.markerColor()),
            animation: google.maps.Animation.DROP, // Shake the marker as it appears
          });
          targetSpot.marker(marker);
        }else {
          window.alert('Could not find that location - try entering a more specific place');
        }
      }
    );
  }
}

// ***********************************
//  HELPER FUNCTIONS
// This function will make a custom marker, Using the supplied color as
//  its base.
function makeMarkerIcon(markerColor){
  // This method of created an image is replaced in v3.10 of the Google Maps JavaScript API (see https://developers.google.com/maps/documentation/javascript/markers for mor detailse)
  var markerImage = new google.maps.MarkerImage(
    // place.icon url
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21,34),
    new google.maps.Point(0,0),
    new google.maps.Point(10,34),
    new google.maps.Size(21,34)
  );
  return markerImage;
}
