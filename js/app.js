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
// Time durations
var durations = [
  {
    value: '10',
    text: '10 min'
  },{
    value: '15',
    text: '15 min'
  },{
    value: '30',
    text: '30 min'
  },{
    value: '60',
    text: '1 hour'
  }
]
// ******************
// Possible transportation modes
var modes = [
  {
    value: 'DRIVING',
    text: 'drive'
  },{
    value: 'WALKING',
    text: 'walk'
  },{
    value: 'BICYCLING',
    text: 'bike'
  },{
    value: 'TRANSIT',
    text: 'transit ride'
  }
]
// ******************
// Favorite locations
var favSpots = [
  {
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
  }
]
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
/**
* ViewModel
*/
var ViewModel = function(){
  // Use for clarity when necessary
  var self = this;
  // **************************
  // Provide global access to this as an object literal
  view_model = this;
  //**********************************
  // Local variables to collect drawing data
  this.polygon = ko.observable(null);
  this.drawingManager = ko.observable(null);
  //**************************
  // TEXT BOXES
  //  Favourite Area search input
  this.favoriteAreaText = ko.observable('');
  //  Zoom to Area search input
  this.timeSearchText = ko.observable('');
  // *************************
  // List of markers for places
  this.placeMarkers = ko.observableArray([]);
  // ***************************
  // List of time durations for time to search option
  this.timeOptions = ko.observableArray([]);
  // Fill timeOptions with pre defined options
  durations.forEach(function(duration){
    self.timeOptions.push(duration);
  });
  // Selected time for search
  this.selectedTime = ko.observable('');
  // ***************************
  // List of possible transportation modes
  this.travelModes = ko.observableArray([]);
  // Fill the possible Modes from the pre defined options
  modes.forEach(function(mode){
    self.travelModes.push(mode);
  });
  // Selected Mode of travel
  this.selectedMode = ko.observable('');
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
  /**
  * @description Menu Toggle button
  */
  this.menuToggle = function(){
    slideout.toggle();
  };
  /**
  * Direction Service object for finding routes
  */
  var directionsService = null;
  this.routes = ko.observableArray([]);
  /**
  * @description GOOGLE MAP STUFF,
  * Initialize google map.  This function is
  * given as the callback function for the
  * google maps api source script in index.html and only called once.
  * @param {google.maps} map
  */
  this.initMap = function(map){
    // lat/long literal for a map and map marker.
    var williams_lake = {lat: 52.1417, lng: -122.1417};
    // Constructor that creates a new map - only center and zoom are required
    //  The first parameter is the element on the page to place the map,
    // TODO: Change to a jQuery reference(?)
    map = new google.maps.Map(document.getElementById('map'),{
      // Set initial location to Williams Lake
      center: williams_lake,
      // Zoom can go up to 21.
      zoom: 13,
      mapTypeControl: true,
      // Place the Map control in the top right corner
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      zoomControl: true,
      // Place the zoom control at top right
      // but below the type control
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      // scaleControl: true,
      streetViewControl: true,
      // Place the street view icon below the zoom control
      // In the top right area of the map
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
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
      self.drawingManager().setDrawingMode(null);
      // Create a new editable polygon from the overlay
      self.polygon(event.overlay);
      console.log("polygon " + self.polygon().getPath());
      // Make it so the user can change the shape without re-drawing
      self.polygon().setEditable(true);
      // Make it so the user can move the shape around the map
      self.polygon().setDraggable(true);
      // Search inside the polygon
      self.searchWithinPolygon();
      // Ensure the search is re-done if the polygon is changed
      self.polygon().getPath().addListener('set_at', self.searchWithinPolygon);
      self.polygon().getPath().addListener('insert_at', self.searchWithinPolygon);
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
    /*
    * Initialize the direction service
    */
    directionsService = new google.maps.DirectionsService();
  };// END OF initMap




  /**
  * @description Zoom to area function
  * Zoom to an area selected by user; it
  * gets the users input from the zoom
  * to area text box then geocodes it for
  * lat/long information
  */
  this.zoomToArea = function() {
    // Initialize a geocoder
    var geocoder = new google.maps.Geocoder();
    // Get the address to zoom to
    // Make sure the address isn't blank
    if(self.favoriteAreaText() == ''){
      // Alert user if there is nothing in
      // the favoriteAreaText text box
      window.alert('Please ad an area or address');
    }else {
      // Geocode the address/area entered; want the center.
      geocoder.geocode(
        { address: self.favoriteAreaText()
        }, function(results, status){
          // Center the map on location if an address or area is found
          if(status == google.maps.GeocoderStatus.OK){
            console.log("    location "+results[0].geometry.location );
            map_global.setCenter(results[0].geometry.location);
            map_global.setZoom(15);
          }else {
            // Alert the user if the status is anything but OK
            window.alert('Could not find that location - try entering a more specific place');
          }
        }
      )

    }
  };
  /**
  * @description Search for cool spots within a given time
  * from a location given by user.
  *  User can also supply mode of travel.
  * TODO: Add distance functionality
  */
  this.searchWithinTime = function(){
    //
    // Initialize the distance matrix
    var distanceMatrixService = new google.maps.DistanceMatrixService;
    // Get the address entered by user
    // Check to make sure the address isn't blank
    if(self.timeSearchText() == ''){
      // Alert the user that there is nothing
      // in the search by time text box.
      window.alert('You need to enter an address');
    }else {
      console.log(" Search Within Time");
      // Hide all cool spot markers first.
      self.hideSpots();
      // Use the distance matrix service to calculate the duration of the
      //  routes between all the markers (origin), and the destination address
      //  entered by the user.
      var origins = [];
      self.spotList().forEach(function(spot){
        // Put all the origins into an origin matrix
        origins.push(spot.marker().position);
      });
      // address given by user is now the destination
      var destination = self.timeSearchText();
      var mode = self.selectedMode();
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
          // Alert user there was an error and what it was
          window.alert("Error was: " + status);
        }else {
          //
          // Display all markers that are within the
          // given time period
          self.displayMarkersWithinTime(response);
        }
      });

    }
  };
  /**
  * @description Display markers within time/distance. As filtered by the calling function.
  *  This is a refactored version of the course example.
  * @param {object[]} response - result of a call to distanceMatrixService.getDistanceMatrix.
  * Sent to a callback function which calls this one.
  */
  this.displayMarkersWithinTime = function(response){
    var origins = response.originAddresses;
    var destivations = response.destinationAddress;
    //
    var atLeastOne = false;
    // Incrementing reference to identify marker
    // that is within the time range selected
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
          // If not, Skip the rest, there is no valid result and alert the user.
          window.alert("There are no cool spots in that area.")
          return;
        }
        // Duration value is given in seconds, convert to minutes.
        var duration = result.duration.value/60;
        // Also need the duration text
        var durationText = result.duration.text;
        // If the route duration is less than the selected time
        if(duration <= self.selectedTime()){
          // set the marker for this result.
          // indavidual marker, to be used later in this function as well.
          var marker = null;
          if(i < self.spotList().length){
            marker = self.spotList()[i].marker();
            marker.setMap(map_global);
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
            '\"view_model.displayDirections(&quot;'+ origins[i] +'&quot;);\">View Route</button></div>'
          });

          // Assign this local infowindow to the marker so the marker will be re-shown on the larger infowindow
          //  if the view changes.
          //  The reason to use markers[] instead of marker is because marker is local and markers[] is the actual global value.
          if(marker){
            // Assign the infowindow to the indicated
            // spotList element
            self.spotList()[i].marker().infowindow = infowindow;
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
      // Alert user that there wasn't any good results found
      window.alert('Sorry, nothing found within your selected time window.')
    }

  };
  /**
  * Clear Directions off the map
  */
  this.clearRoutes = function(){
    self.routes().forEach(function(route){
      route.setMap(null);
    });
    // Clean all routes from array.
    self.routes.removeAll();
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
  // Search inside the polygon
  this.searchWithinPolygon = function(){
    self.spotList().forEach(function(spot){
      console.log(" Search Within Poly: target "+spot.name());
      // Check if the markers position is inside the global polygon area
      if(google.maps.geometry.poly.containsLocation(spot.marker().position,self.polygon())){
        spot.marker().setMap(map_global);// its inside so add it to the map
      }else{
        spot.marker().setMap(null);// its not inside so remove it
      }
    });
  };
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
  /**
  * TODO: Display Directions
  * Information for browser based call can be found https://developers.google.com/maps/documentation/directions/
  * And for using the API from JavaScript, here:
  * https://developers.google.com/maps/documentation/javascript/directions
  */
  this.displayDirections = function(position){
    self.hideSpots();
    //Get the destination address from the user entered value.
    // TODO: Change to knockoutjs data-bind(ing)
    var destinationAddress = self.timeSearchText();
    // Get the mode again from the user entered value
    // TODO: Change to knockoutjs data-bind(ing)
    var mode = self.selectedMode();
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
        // TODO: Make an observableArray to hold the directions for
        // multiple routes.
        var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map_global,
          directions: response,
          draggable: true,
          polylineOptions: {
            strokeColor: 'green'
          }
        });
        self.routes.push(directionsDisplay);
      }else {
        // Direction request failed, notify user
        window.alert('Directions request failed due to '+status);
      }
    });

  };
  //**********************************
  // TODO: Make a function that does something when the
  //  spot name is clicked
  this.shakeNameMarker = function(obj){
    console.log("Shake Name: " + obj.name());
    //
    self.currentSpot(obj);
    // TODO: Figure out why the currentSpot isn't working
    // console.log("Current Name: "+self.currentSpot.name());
    // If the marker isn't visible show it with a drop
    if(map_global.getBounds().contains(obj.marker().getPosition()) !== null){
      // TODO: Find a way to check when the marker is on the map.  This way doesn't work.
      console.log(" Why?");
      obj.marker().setMap(map_global);
    }else {
      console.log(" What?");
      obj.marker().setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){ obj.marker().setAnimation(null); }, 2000);
    }

  };
}
//
/**
* @description Called to show cool spot
* markers on the map. Uses the ViewModel
* (self) spotList.
*/
ViewModel.prototype.showSpots = function(){
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
/**
* @description Called to hide cool spots
*/
ViewModel.prototype.hideSpots = function(){
  this.spotList().forEach(function(spot){
    spot.marker().setMap(null);
  });
};

/**
* @description Hide markers that are sent
* in an array. Sets each markers map object
* to null.
* @param {object[]} markers - an array of google map markers.
*/
ViewModel.prototype.hideMarkers = function(markers){
  console.log("Hide Markers");
  markers.forEach(function(marker){
    marker.setMap(null);
  })
};
/**
* @description Toggle Drawing function
* Toggling the drawing manager
*  Either starts drawing mode so user can
*  draw a polyline box around an area of
*  interst OR clears the box from the map.
* Uses the viewModel drawingManager.
*/
ViewModel.prototype.toggleDrawing = function(){
  if(this.drawingManager().map){
    this.drawingManager().setMap(null);
    // Remove any polygon
    if(this.polygon()){
      this.polygon().setMap(null);
    }
  }else{
    this.drawingManager().setMap(map_global);
  }
};

/**
* @description Entry point for Neighborhood Map
*/
ko.applyBindings(new ViewModel());



// ***********************************
//  HELPER FUNCTIONS
