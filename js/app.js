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
  this.imgSrc = ko.observable(data.imgSrc);
  //
  this.imgAttribution = ko.observable(data.imgAttribution);
  //
  this.reviews = ko.observableArray(data.reviews);
  // TODO: Add computed observables; get more information about this spot, map marker, etc.
  // Map marker for this object
  this.marker = ko.computed(function(){
    console.log("Marker, computed");
    return null;
  });
}
// Create a google maps marker for the address parameter
var createMarker = function(title, address){
    console.log("Create Marker for "+title+" @ "+address);
  // Get the location literal from a geocoder
  var markPoint = getGeocode(address);
  console.log("   Mark Point: "+markPoint);
  // Make a new marker
  var marker = new google.maps.Marker({
    position: markPoint,// Location of marker on map
    title: title,// What will show when the marker is hovered over
    icon: makeMarkerIcon('070B57'),
    animation: google.maps.Animation.DROP, // Shake the marker as it appears
  });
  return marker;
}
// Get the geo coded lat and long from an address
var getGeocode = function(address){
  console.log("  Get Geocode for "+address);
  var self = this;
  var mapPoint = null;
  // Initialize a geocoder
  var geocoder = new google.maps.Geocoder();
  // Make sure the address isn't blank
  if(address == ''){
    window.alert('Address: '+address+', is not valid.');
    return null;
  }else {
      console.log("getGeocode "+address);
    // Geocode the address/area entered; want the center.
    geocoder.geocode(
      { address: address }// keep within city
      , function(results, status){
        // Center the map on location if an address or area is found
        console.log("   Map "+map_global);
        console.log("  Status: "+status);
        console.log("   Partial Match: " +results[0].partial_match);
        if(status == google.maps.GeocoderStatus.OK){
          map_global.setCenter(results[0].geometry.location);
          map_global.setZoom(18);
          // self.mapPoint = results[0].geometry.location;
          console.log("   Map Point: " + results.formatted_address);
          // map.setCenter(results[0].geometry.location);
          // map.setZoom(18);
        }else {
          window.alert('Could not find that location - try entering a more specific place');
        }
      }
    );

  }
  return self.mapPoint;
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
    // self.spotList().forEach(function(spot){
    //   console.log("Spot List, Address: "+spot.address());
    //   createMarker(spot.name(),spot.address());
    // });
    // Testing
    createMarker("Test","12 Oliver Street, Williams Lake, BC");

  };

  // *************************************
}

ko.applyBindings(new ViewModel());

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
