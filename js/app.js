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
  this.polygon = ko.observable(null);
  this.drawingManager = ko.observable(null);
  // *************************
  // List of markers for places
  this.placeMarkers = ko.observableArray([]);
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
      self.buildMarker(spot);
    });
    // Testing
    // createMarker("Test","12 Oliver Street, Williams Lake, BC");
    //***
    // Add Drawing manager for polygon shapes
    self.drawingManager(new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON
        ]
      }
    }));

    // Add event listener for drawing manager
    //  that checks for the captured polygon
    //  Once there is a polygon this function will call for a search within
    //  the polygon area and eliminate any markers that are not in that area.
    self.drawingManager().addListener('overlaycomplete', function(event){
      console.log("Drawing Manager listener");
      //Check for an existing polygon
      if(self.polygon()){
        // if there is get rid of it
        self.polygon().setMap(null);
        // Hide any listings
        hideMarkers(markers);
      }
      // Switching the drawing mode to the HAND (no longer drawing)
      //  So the user can click the markers
      drawingManager.setDrawingMode(null);
      // Create a new editable polygon from the overlay
      self.polygon(event.overlay);
      console.log("polygon " + polygon().getPath());
      // Make it so the user can change the shape without re-drawing
      self.polygon().setEditable(true);
      // Make it so the user can move the shape around the map
      self.polygon().setDraggable(true);
      // Search inside the polygon
      searchWithinPolygon();
      // Ensure the search is re-done if the polygon is changed
      self.polygon().getPath().addListener('set_at', searchWithinPolygon);
      self.polygon().getPath().addListener('insert_at', searchWithinPolygon);
      // Get the area of the polygon, result is in meters
      var area = google.maps.geometry.spherical.computeArea(self.polygon().getPath());
      area = area.toFixed(2);
      console.log("  Area is " + area + "m");
      // Get the length of the ploygon lines, result is in meters
      var length = google.maps.geometry.spherical.computeLength(self.polygon().getPath());
      length = length.toFixed(2);
      console.log("  Length is " + length + "m");
      // Show length and area
      window.alert("The Area is " + area + " square meters and the Length is " + length + "m");
    });

  };// END OF initMap
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
  //***************************
  // TODO: Toggle Drawing function
  // Toggle the drawing manager.
  function toggleDrawing(drawingManager){
      if(drawingManager.map){
          drawingManager.setMap(null);
          // Remove any polygon
          if(self.polygon()){
              self.polygon().setMap(null);
          }
      }else{
          drawingManager.setMap(map);
      }
  }
  //***************************
  // TODO: Zoom to area function
  // Zoom to an area selected by user; it gets the users input from the zoom
  //   to area text box then geocodes it for lat/long information
  this.zoomToArea = function() {
      // Initialize a geocoder
      var geocoder = new google.maps.Geocoder();
      // Get the address to zoom to
      // TODO: Replace this with a knockout JS data-bind(ing)
      var address = document.getElementById('zoom-to-area-text').value;
      // Make sure the address isn't blank
      if(address == ''){
          window.alert('Please ad an area or address');
      }else {
          // Geocode the address/area entered; want the center.
          geocoder.geocode(
              { address: address,
                  componentRestrictions: {locality: 'New York'}// keep within city
              }, function(results, status){
                  // Center the map on location if an address or area is found
                  if(status == google.maps.GeocoderStatus.OK){
                      map.setCenter(results[0].geometry.location);
                      map.setZoom(18);
                  }else {
                      window.alert('Could not find that location - try entering a more specific place');
                  }
              }
          )

      }
  };
  //***************************
  // TODO: Within time or distance
  // Search for listings within a given time from a location given by user.
  //  User can also supply mode of travel.
  // TODO: Add distance functionality
  this.searchWithinTime = function(){
      //
      // Initialize the distance matrix
      var distanceMatrixService = new google.maps.DistanceMatrixService;
      // Get the address entered by user
      // TODO: Change to knockout JS data-bind(ing)
      var address = document.getElementById('search-within-time-text').value;
      // Check to make sure the address isn't blank
      if(address == ''){
          window.alert('You need to enter an address');
      }else {
          //
          // TODO: Add hideMarkers function somewhere
          hideMarkers(self.spotList().markers);
          // Use the distance matrix service to calculate the duration of the
          //  routes between all the markers (origin), and the destination address
          //  entered by the user.
          var origins = [];
          self.spotList().markers.forEach(function(marker){
              // Put all the origins into an origin matrix
              //
              // TODO: Convert and add an origins array
              origins.push(marker.position);
          });
          // address given by user is now the destination
          var destination = address;
          // TODO: Change to knockout JS data-bind(ing)
          var mode = document.getElementById('mode').value;
          //
          // Call the google distance matrix service;
          //  Find the how to here: https://developers.google.com/maps/documentation/javascript/distancematrix
          distanceMatrixService.getDistanceMatrix({
              origins: origins,
              destinations: [destination],
              travelMode: google.maps.TravelMode[mode],
              unitSystem: google.maps.UnitSystem.IMPERIAL,
          }, function(response, status){
              // This is the callback function that results will be sent to
              //
              if(status !== google.maps.DistanceMatrixStatus.OK){
                  window.alert("Error was: " + status);
              }else {
                  //
                  // TODO: Add this function somewhere
                  displayMarkersWithinTime(response);
              }
          });

      }
  };
  //****************************
  // TODO: Display markers within time/distance
  //  This is a refactored version of the course example.
  this.displayMarkersWithinTime = function(response){
      var origins = response.originAddresses;
      var destivations = response.destinationAddress;
      // TODO: Change to knockout JS data-bind(ing)
      var maxDuration = document.getElementById('max-duration').value;
      //
      var atLeastOne = false;
      var i = 0;
      // Go through each response address and compare the time it
      //  takes
      response.rows.forEach(function(results){
          results.elements.forEach(function(result){

              // The distance .value is returned in feet - set by the UnitSystem parameter - but the .text is in miles.
              //  if you want to change the logic to show markers in a distance, you need the value for distance; 'result.distance.value' only need text here tho.
              var distanceText = null;
              // Make sure the result has a distance
              if(result.distance){
                  distanceText = result.distance.text;
              }else {
                  // If not, Skip the rest, there is no valid result
                  return;
              }
              // Duration value is given in seconds, convert to minutes.
              var duration = result.duration.value/60;
              // Also need the duration text
              var durationText = result.duration.text;
              if(duration <= maxDuration){
                  //
                  // set the marker for this result.
                  // indavidual marker, to be used later in this function as well.
                  // TODO: This will require extra thought
                  var marker = null;
                  if(i < markers.length){
                      marker = markers[i];
                      marker.setMap(map);
                  }
                  //
                  // Obviously at least one marker is within range
                  atLeastOne = true;
                  // Create a mini infowindow to open immediately and
                  //  contain the distance and duration
                  // TODO: Change to knockoutjs data-bind(ing)
                  var infowindow = new google.maps.InfoWindow({
                      content: durationText + ' away, about ' + distanceText +
                      '<div><button type=\"button\" id=\"display-directions\" onClick='+
                      '\"displayDirections(&quot;'+ origins[i] +'&quot;);\">View Route</button></div>'
                  });

                  // Assign this local infowindow to the marker so the marker will be re-shown on the larger infowindow
                  //  if the view changes.
                  //  The reason to use markers[] instead of marker is because marker is local and markers[] is the actual global value.
                  if(marker){
                    // TODO: Requires extra thought
                      markers[i].infowindow = infowindow;
                      // event listener for infowindow click, to close this local infowindow.
                      google.maps.event.addListener(marker, 'click', function(){
                          marker.infowindow.close();
                      });

                  }
                  // Show the marker
                  infowindow.open(map_global, marker);
              }
              // increment i for marker selection
              i = i + 1;
          });

      });
      //
      if(!atLeastOne){
          window.alert('Sorry, nothing found within your selected time window.')
      }

  };
  //*****************************
  // TODO: Search by nearby places

  //******************************
  // TODO: Search by text places
  // Called when 'go' button for search places is clicked
  //  It will go a nearby search using the entered query string or place.
  function textSearchPlaces(){
      var bounds = map_global.getBounds();
      hideMarkers(placeMarkers);
      var placesService = new google.maps.places.PlacesService(map);
      // TODO: Change to knockoutjs data-bind(ing)
      placesService.textSearch({
          query:
           document.getElementById('places-search').value,
          bounds: bounds
      },function(results, status){
          if(status === google.maps.places.PlacesServiceStatus.OK){
              createMarkersForPlaces(results);
          }
      });
  }
  //******************************
  // TODO: Create markers for places
  // Create markers for all places that are searched for
  this.createMarkersForPlaces = function(places){
      var mapBounds = new google.maps.LatLngBounds();
      places.forEach(function(place){
          // Marker icon parameters
          var icon = {
              url: place.icon,// special icon
              size: new google.maps.Size(35, 35),
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(15,34),
              scaledSize: new google.maps.Size(25,25)
          };
          // Create a marker
          var marker = new google.maps.Marker({
              map: map_global,
              icon: icon,
              title: place.name,
              position: place.geometry.location,
              id: place.place_id
          });
          // Info window for place search result information details
          var placeInfoWindow = new google.maps.InfoWindow();
          // Event listener for when the marker is clicked
          marker.addListener('click',function(){
              if(placeInfoWindow.marker == this){
                  console.log("This infowindow already is on this marker");
              }else {
                // TODO: Make this function
                  getPlacesDetails(this, placeInfoWindow);
              }
          });
          // Add markers to the placeMarker array
          self.placeMarkers().push(marker);
          if(place.geometry.viewport){
              // Only geocodes have viewport.
              mapBounds.union(place.geometry.viewport);
          }else {// adjust map bounds if necessary to acomadate results
              mapBounds.extend(place.geometry.location);
          }
          // Move the center of the map to the marker that
          //  is in the middle of of the grouping
          map_global.setCenter(mapBounds.getCenter());
          // Make sure the map shows all markers
          map_global.fitBounds(mapBounds);
      });
  };
  //*******************************
  // TODO: Build cool spot markers
  // Build a map marker for the targetted cool spot
  this.buildMarker = function(targetSpot){
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
              icon: self.makeMarkerIcon(targetSpot.markerColor()),
              animation: google.maps.Animation.DROP, // Shake the marker as it appears
            });
            targetSpot.marker(marker);
          }else {
            window.alert('Could not find that location - try entering a more specific place');
          }
        }
      );
    }
  };
  //******************************
  // TODO: get place details
  //  The PLACE DETAILS search; most detailed so it is only executed
  //      when a marker is selected, indicating the user wants more
  //      details about the place
  this.getPlacesDetails = function(marker,detailInfoWindow){
      var service = new google.maps.places.PlacesService(map_global);
      service.getDetails({
          placeId: marker.id
      }, function(place, status){
          if(status === google.maps.places.PlacesServiceStatus.OK){
            // TODO: Change to knockoutJS data-bind(ing's)
              // Set the marker property on this infowindow so it isn't created again.
              detailInfoWindow.marker = marker;
              var innerHTML = '<div>';
              if(place.name){
                  innerHTML += '<strong>'+ place.name +'</strong>';
              }
              if(place.formatted_address){
                  innerHTML += '<br>' + place.formatted_address;
              }
              if(place.formatted_phone_number){
                  innerHTML += '<br>' + place.formatted_phone_number;
              }
              if(place.opening_hours){
                  innerHTML += '<br><br><strong>Hours:</strong><br>'+
                  place.opening_hours.weekday_text[0]+'<br>'+
                  place.opening_hours.weekday_text[1]+'<br>'+
                  place.opening_hours.weekday_text[2]+'<br>'+
                  place.opening_hours.weekday_text[3]+'<br>'+
                  place.opening_hours.weekday_text[4]+'<br>'+
                  place.opening_hours.weekday_text[5]+'<br>'+
                  place.opening_hours.weekday_text[6]+'<br>';
              }
              // TODO: Change to knockoutJS data-bind(ing's)
              if(place.photos){
                  //
                  innerHTML += '<br><br><img src="'+ place.photos[0].getUrl({maxHeight: 100, maxWidth: 200}) + '">';

              }
              // TODO: Change to knockoutJS data-bind(ing's)
              // Place HTML
              detailInfoWindow.setContent(innerHTML);
              // Open marker info window with details
              detailInfoWindow.open(map, marker);
              // add a close click listener
              detailInfoWindow.addListener('closeclick',function(){
                  detailInfoWindow.marker = null;
              });
          }
      });
  };
  //*****************************
  // TODO: Search within polygon

  //******************************
  // TODO: populateInfoWindow
  // This function will populate the infowindow when the marker is clicked.
  //  We'll only allow one infowindow at a time.  When clicked it will be
  //  populated with the related information
  this.populateInfoWindow = function(marker, infowindow){
      // Make sure the infowindow is not already opened on this marker
      if(infowindow.marker != marker){
          infowindow.marker = marker;
          // Add the marker title to an element in the infowindow
          infowindow.setContent('<div>'+ marker.title +'</div>');
          // Open the content on the map
          infowindow.open(map_global, marker);
          // Clear the marker property if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
              infowindow.setMarker(null);
          });
          // Set up street view stuff
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;// 50 meters
          //
          function getStreetView(data, status){
              if(status == google.maps.StreetViewStatus.OK){
                  var nearStreetViewLocation = data.location.latLng;
                  // Get the direction to face in order to see the fron of the building
                  var heading = google.maps.geometry.spherical.computeHeading(
                      nearStreetViewLocation, marker.position
                  );
                  // Create a div for the street view image
                  infowindow.setContent('<div>'+marker.title+'</div><div id="pano"></div>');
                  var panoramaOptions = {
                      position: nearStreetViewLocation,
                      pov: {
                          heading: heading,
                          pitch: 30// looking up or down at building
                      }
                  };
                  var panorama = new google.maps.StreetViewPanorama(
                      document.getElementById('pano'), panoramaOptions
                  );
              } else {
                  infowindow.setContent('<div>'+ marker.title +'</div>' + '<div>No Street View Found</div>');
              }
          }
          // Use the streetview service to get the closest streetview image
          //  within 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map_global, marker);
      }
  };
  //*******************************
  // TODO: Make Marker Icon (possible a helper function)
  // This function will make a custom marker, Using the supplied color as
  //  its base.
  this.makeMarkerIcon = function(markerColor){
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
  };
  //*******************************
  // TODO: Display Directions
  // Information for browser based call can be found https://developers.google.com/maps/documentation/directions/
  // And for using the API from JavaScript, here: https://developers.google.com/maps/documentation/javascript/directions
  this.displayDirections = function(position){
      hideMarkers(markers);
      // Get the destination address from the user entered value.
      // TODO: Change to knockoutjs data-bind(ing)
      var destinationAddress = document.getElementById('search-within-time-text').value;
      // Get the mode again from the user entered value
      // TODO: Change to knockoutjs data-bind(ing)
      var mode = document.getElementById('mode').value;
      //
      directionsService.route({
          // The origin is the passed in marker's position
          origin: position,
          // The destination is user entered address.
          destination: destinationAddress,
          travelMode: google.maps.TravelMode[mode]
      },function(response, status){
          // If the route is valid and call is successful...
          if(status === google.maps.DirectionsStatus.OK){
              // Get a directions renderer to place the route on the map, could also
              //  show the directions by setting the 'panel' parameter with the
              //  html div that we want it to go to
              //  Show polyline of route.
              var directionsDisplay = new google.maps.DirectionsRenderer({
                  map: map_global,
                  directions: response,
                  draggable: true,
                  polylineOptions: {
                      strokeColor: 'green'
                  }
              });
          }else {
              window.alert('Directions request failed due to '+status);
          }
      });

  };
}

ko.applyBindings(new ViewModel());



// ***********************************
//  HELPER FUNCTIONS
