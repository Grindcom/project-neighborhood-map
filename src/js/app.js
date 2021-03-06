// Neighborhood Map project
// Main JavaScript
// Author: Greg Ford, B.Sc.
// Start Date: Dec. 13, 2016
// And Still going in 2017
/*global google: false*/
//
// GLOBALS
//
  var view_model;
// Google Map object
  var MAP_GLOBAL;
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
    }, {
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        // {color: '#141A8E'},
        {weight: 2}
      ]
    }, {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        // {color: '#CD7200'}
      ]
    }, {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        // {color: '#7D4600'},
        {lightness: -40}
      ]
    }, {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        // {color: '#FFD04C'},
        {lightness: -40}
      ]
    }, {
      featureType: 'transit.station',
      stylers: [
        {weight: 9},
        {hue: '#262CAD'}
      ]
    }, {
      featureType: 'transit.station',
      elementType: 'labels.icon',
      stylers: [
        {visibility: 'on'}
      ]
    }, {
      featureType: 'landscape.man_made',
      elementType: 'geometry.fill',
      stylers: [
        // {color: '#FFD04C'},
        {lightness: 20}
      ]
    }, {
      featureType: 'landscape.natural',
      elementType: 'geometry.fill',
      stylers: [
        // {color: '#7D4600'},
        // {lightness: -40}
      ]
    }
  ];
// ******************
// Time durations
  var durations = [
    {
      value: '10',
      text: '10 min'
    }, {
      value: '15',
      text: '15 min'
    }, {
      value: '30',
      text: '30 min'
    }, {
      value: '60',
      text: '1 hour'
    }
  ];
// ******************
// Possible transportation modes
  var modes = [
    {
      value: 'DRIVING',
      text: 'drive'
    }, {
      value: 'WALKING',
      text: 'walk'
    }, {
      value: 'BICYCLING',
      text: 'bike'
    }, {
      value: 'TRANSIT',
      text: 'transit ride'
    }
  ];
// ******************
// Favorite locations
  var favSpots = [
    {
      name: 'Oliver Street Bar and Grill',
      type: 'Pub',
      address: '23 Oliver St, Williams Lake, BC',
      geoLocation: '',
      closeTo: [""],
      imgSrc: '',
      imgAttribution: ''
    }, {
      name: 'Sushi California',
      type: 'Restaurant',
      address: '770 Oliver St, Williams Lake, BC',
      geoLocation: '',
      closeTo: [""],
      imgSrc: '',
      imgAttribution: ''
    }, {
      name: 'Mings Palace',
      type: 'Restaurant',
      address: '12 Oliver Street, Williams Lake, BC',
      geoLocation: '',
      closeTo: [""],
      imgSrc: '',
      imgAttribution: ''
    }, {
      name: 'Bean Counter Bistro & Coffee Bar',
      type: 'Bistro',
      address: 'Suite B 180 3rd Ave N, Williams Lake, BC',
      geoLocation: '',
      closeTo: [""],
      imgSrc: '',
      imgAttribution: ''
    }, {
      name: 'Overlander Pub',
      type: 'Pub',
      address: '1118 Lakeview Crescent, Williams Lake, BC',
      geoLocation: '',
      closeTo: [""],
      imgSrc: '',
      imgAttribution: ''
    }, {
      name: 'The Laughing Loon',
      type: 'Pub',
      address: '1730 Broadway Ave S, Williams Lake, BC',
      geoLocation: '',
      closeTo: [""],
      imgSrc: '',
      imgAttribution: ''
    }
  ];
  /**
   * Cool Spot
   * @param {type} data
   * @param {type} id
   * @returns {CoolSpot}
   */
  var CoolSpot = function (data, id) {
    this.id = id;
    //
    this.clickCount = ko.observable(0);
    //
    this.name = ko.observable(data.name);
    //
    this.selected = false;
    //
    this.address = ko.observable(data.address);
    //
    this.type = ko.observable(data.type);
    //
    this.geoLocation = ko.observable(data.geoLocation);
    //
    this.closeTo = ko.observableArray([]);
    //
    this.markerColor = '070B57';
    //
    this.markerHighlightColor = 'FFFF24';
    //
    this.imgSrc = data.imgSrc;
    //
    this.imgAttribution = data.imgAttribution;
    //
    this.marker = null;
    //
    this.markerVisible = ko.observable(false);
    /**
     * @description Return the name and clickCount together
     */
    this.nameAndCount = ko.computed(function () {
      return this.name() + " | " + this.clickCount() + " Likes";
    }, this);
    /**
     * @description Return Likes in a condensed variable
     */
    this.likes = ko.computed(function () {
      return " | " + this.clickCount() + " Likes";
    }, this);

  };
  /**
   * ViewModel
   * @returns {ViewModel}
   */
  var ViewModel = function () {
    // Use for clarity when necessary
    var self = this;
    // **************************
    // Provide global access to this as an object literal
    view_model = this;
    //***************************
    // Favourites Title variable
    this.defaultSpotTitle = 'Cool Spots';
    this.spotTitle = ko.observable(this.defaultSpotTitle);
    //****************************
    // InfoWindow for markers
    this.largeInfowindow = null;
    //**********************************
    // POLYGON VARIABLES
    // Local variables to collect drawing data
    this.polygon = null;
    this.drawingManager = null;
    // sketch Toggle Value options
    this.DRAWPOLY = 'Draw a Filter Area Polygon';
    this.CLEARPOLY = 'Clear Polygon';
    // Current name to show on the sketch filter toggle button
    // (Has to be observable)
    this.sketchToggleValue = ko.observable(this.DRAWPOLY);
    //**********************************
    // ZOOM Variables
    this.zoomed = false;
    this.ZOOMIN = 'Zoom to Your Area';
    this.ZOOMOUT = 'Zoom Back';
    this.zoomText = this.ZOOMIN;//ko.observable();
    //**************************
    // TEXT BOXES
    //  Favourite Area search input
    //  Zoom to Area search input
    this.timeSearchText = ko.observable('');
    // *************************
    // List of markers for places
    this.placeMarkers = ko.observableArray([]);
    // ***************************
    // List of time durations for time to search option
    this.timeOptions = ko.observableArray([]);
    // Fill timeOptions with pre defined options
    durations.forEach(function (duration) {
      self.timeOptions.push(duration);
    });
    // Selected time for search
    this.selectedTime = ko.observable(null);
    // ***************************
    // List of possible transportation modes
    this.travelModes = ko.observableArray([]);
    // Fill the possible Modes from the pre defined options
    modes.forEach(function (mode) {
      self.travelModes.push(mode);
    });
    // Selected Mode of travel
    this.selectedMode = ko.observable('');
    // ***************************
    // List of favorites locations
    this.spotList = [];//
    this.filteredSpotList = ko.observableArray([]);
    // Load the favorite location list with static data
    var i = 0;
    favSpots.forEach(function (location) {
      var spot = new CoolSpot(location, i++);
      self.spotList.push(spot);
      self.filteredSpotList.push(spot);
    });
    // ***************************
    // Current Spot selected
    this.currentSpot = ko.observable(self.spotList[0]);
    // *********************
    // List for nearby locations (use with foursquare api)
    this.nearbyList = ko.observableArray([]);
    this.nearbyCount = 0;
//    this.nearbyList().push(new CoolSpot(favSpots[0],1));
    this.addNearbySpots = function (spot) {
      // console.log("Add nearby spots..." + spot.name);//new CoolSpot(spot,this.nearbyCount++)
      self.nearbyList.push(spot);
      // console.log("----List size " + this.nearbyList().length);
      //
    };
    /**
     * Get the full list of nearby spots
     * @returns {ko.observableArray.result}
     */
    this.getNearbyList = function () {
      return this.nearbyList();
    };
    /**
     * Clear the whole list of nearby spots
     * @returns {undefined}
     */
    this.clearNearbyList = function () {
      while (this.nearbyList().length > 0) {
        this.nearbyList.pop();
      }
    };
    /**
     * Compile List of selected favorite places
     * @returns {String}
     */
    this.compileNearbyList = function () {
      // Clear list
      self.clearNearbyList();
      // Add selected items to list
      self.spotList.forEach(function (spot) {
        if (spot.selected) {
          self.nearbyList.push(spot);
        }
      });
      return self.clearNearbyList().length > 0 ?
              "Your Selected List: " : "Nothing Selected";
    };
    // *********************
    // MENU AND SUB MENU SECTION
    // Arrow constants 
    // Up arrow (unicode)
    this.UPARROW = '\u27F0';
    // Down arrow (unicode)
    this.DOWNARROW = '\u27F1';
    // Left arrow (unicode)
    this.LEFTARROW = "\\u21DA";
    //
    this.RIGHTARROW = '\u21DB';
    // Left/Right arrow for slideout menu (has to be observable to work)
    this.menuToggleArrow = ko.observable(this.LEFTARROW);
    // Set up slideout menu
    // Referenced http://codepen.io/gearmobile/pen/ZbbQBw
    var slideout = new Slideout({
      'panel': document.getElementById('main'),
      'menu': document.getElementById('sidebar'),
      'padding': 256,
      'tolerance': 70,
      'side': 'right'
    });
    // Get a reference to the first element
    // of class 'fixed'
    var blockFixed = document.querySelector('.fixed');
    // When a slideout 'beforeopen' event is
    // detected, add a 'fixed-open' class to
    // the fixed class element
    slideout.on('beforeopen', function () {
      blockFixed.classList.add('fixed-open');
    });
    // When a slideout 'beforeclose' event is
    // detected, remove the 'fixed-open' class to
    // the fixed class element
    slideout.on('beforeclose', function () {
      blockFixed.classList.remove('fixed-open');
    });
    /**
     * @description Toggle the Sidebar menu open or closed
     * @param {type} data
     * @param {type} event - Calling element
     * @returns {undefined}
     */
    this.menuToggle = function (data, event) {
      slideout.toggle();
      // Set the proper arrow direction
      if (this.menuToggleArrow() === this.LEFTARROW) {
        this.menuToggleArrow(this.RIGHTARROW);
      } else {
        this.menuToggleArrow(this.LEFTARROW);
      }
    };
    // SUB MENU
    //
    /**
     * @description Direction Service object for finding routes
     */
    var directionsService = null;
    this.routes = [];
    /**
     * @description GOOGLE MAP STUFF,
     * Initialize google map.  This function is
     * given as the callback function for the
     * google maps api source script in index.html and only called once.
     * @param {google.maps} map
     */
    this.initMap = function (map) {
      // lat/long literal for a map and map marker.
      var williams_lake = {lat: 52.1417, lng: -122.1417};
      // Constructor that creates a new map - only center and zoom are required
      //  The first parameter is the element on the page to place the map,
      map = new google.maps.Map(document.getElementById('map'), {
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
      /**
       * Set the new map to the Global map variable
       */
      MAP_GLOBAL = map;
      // Set the marker with the position and the map object created above.
      var marker = new google.maps.Marker({
        position: williams_lake,
        map: MAP_GLOBAL,
        title: 'Center of Williams Lake'
      });
      // set up markers for the cool spots
      self.spotList.forEach(function (spot) {
        //**
        // Build the marker for this spot
        self.buildMarker(spot);

      });
      //***
      // Create a new InfoWindow
      self.largeInfowindow = new google.maps.InfoWindow();
      //***
      // Add Drawing manager for polygon shapes
      self.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON
          ]
        }
      });

      // Add event listener for drawing manager
      //  that checks for the captured polygon
      //  Once there is a polygon this function will call for a search within
      //  the polygon area and eliminate any markers that are not in that area.
      self.drawingManager.addListener('overlaycomplete', function (event) {
        //Check for an existing polygon
        if (self.polygon) {
          // if there is get rid of it
          self.polygon.setMap(null);
          // Hide any listings
          self.hideMarkers(self.placeMarkers());
        }
        // Switching the drawing mode to the HAND (no longer drawing)
        //  So the user can click the markers
        self.drawingManager.setDrawingMode(null);
        // Create a new editable polygon from the overlay
        self.polygon = event.overlay;
        // console.log("polygon " + self.polygon.getPath());
        // Make it so the user can change the shape without re-drawing
        self.polygon.setEditable(true);
        // Make it so the user can move the shape around the map
        self.polygon.setDraggable(true);
        // Search inside the polygon
        self.searchWithinPolygon();
        // Ensure the search is re-done if the polygon is changed
        self.polygon.getPath().addListener('set_at', function () {

          self.searchWithinPolygon();
        });
        self.polygon.getPath().addListener('insert_at', function () {

          self.searchWithinPolygon();

        });
      });
      /*
       * Initialize the direction service
       */
      directionsService = new google.maps.DirectionsService();
      /**
       * Show all spots by default
       */
//      this.showSpots();
    };// END OF initMap
    
    this.mapLoadError = function () {
      var load_error_mes = "Ooops!\nThere seems to be a problem loading the map.\n" +
              "Should I try again?";
      console.log("Map Load Error");

      if (window.confirm(load_error_mes) === true) {
        console.log("---re-load");
        // Re-load map
        // Ref: https://stackoverflow.com/questions/8545125/how-to-get-json-results-placed-on-google-maps
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://maps.googleapis.com/maps/api/js?"+
                "key=AIzaSyB1Vs3ktrsweXIEICK-axcOk_Smy7-plgU&"+
                "libraries=drawing,geometry,places&v=3&callback=view_model.initMap";
        script.onerror = "view_model.mapLoadError()";
        //Empty the google map script and re-send it
        // Ref:https://stackoverflow.com/questions/10290019/jquery-replace-html-element-contents-if-id-begins-with-prefix
        $('#map-script').empty().append(script);
      }
    };

    /**
     * @description The PLACE DETAILS search; most detailed so it is only executed
     * when a marker is selected, indicating the user wants more
     * details about the place
     * @param {type} marker - googlemaps marker object
     * @param {type} detailInfoWindow - googlemaps information window object
     * @returns {undefined}
     */
    this.getPlacesDetails = function (marker, detailInfoWindow) {
      var service = new google.maps.places.PlacesService(MAP_GLOBAL);
      service.getDetails({
        placeId: marker.id
      }, function (place, status) {
        // Set the marker property on this infowindow so it isn't created again.
        detailInfoWindow.marker = marker;
        var innerHTML = '<div>';
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          if (place.name) {
            innerHTML += '<strong>' + place.name + '</strong>';
          }
          if (place.formatted_address) {
            innerHTML += '<br>' + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += '<br>' + place.formatted_phone_number;
          }
          if (place.opening_hours) {
            innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6] + '<br>';
          }
          if (place.photos) {
            //
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl({maxHeight: 100, maxWidth: 200}) + '">';

          }

        }else{
          // Error handling
          innerHTML += 'There are no Place details available at this time</div>';
        }
        // Place HTML
        detailInfoWindow.setContent(innerHTML);
        // Open marker info window with details
        detailInfoWindow.open(map, marker);
        // add a close click listener
        detailInfoWindow.addListener('closeclick', function () {
          detailInfoWindow.marker = null;
        });
      });
    };

    /**
     * 
     * @description This function will populate the infowindow when the marker is clicked.
     * We'll only allow one infowindow at a time.  When clicked it will be
     * populated with the related information
     * @param {type} spot - cool spot object
     * @returns {undefined}
     */
    this.populateInfoWindow = function (spot) {
              /**
         * @description Parse the data received from
         * A call to the streetview service
         * @param data - information packet
         * @param status -
         */
        function getStreetView(data, status) {
          if (status === google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            // Get the direction to face in order to see the fron of the building
            var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, spot.marker.position
                    );

            // Options for the street view service
            // request
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {// Point of View for street view
                heading: heading,
                pitch: 10// looking up or down at building
              }
            };
            // get a street view panorama object and
            // place it in the pano div.
            var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions
                    );
          } else {
                        pano_html = '<div>No Street View Found</div>';
            self.largeInfowindow.setContent(content_html + pano_html + foursquare_html);

          }
        }

        /**
         * @description Callback function, to respond when Foursquare query finishes
         * @returns {undefined}
         */
        function callbackFromFoursquare() {
          // If there are nearby spots, add them to an html list
          if (spot.closeTo().length > 0) {
            var tmp_html = "";
            spot.closeTo().forEach(function (nearbyspot) {
               tmp_html += "<li><strong>"+nearbyspot.type + " - </strong>" + nearbyspot.name + "</li>";
            });
            foursquare_html = "<h3>According to Foursquare this is close to a</h3><ul>"+tmp_html+"</ul>";
          }
          // Use the streetview service to get the closest streetview image
          //  within 50 meters of the markers position
          streetViewService.getPanoramaByLocation(spot.marker.position, radius, getStreetView);
          // Create a div for the street view image
          self.largeInfowindow.setContent(content_html + pano_html + foursquare_html);  
          // Open the infowindow on the correct marker.
          self.largeInfowindow.open(MAP_GLOBAL, spot.marker);
        }
//      // console.log("populateInfoWindow ");
      // Make sure the infowindow is not already opened on this marker
      if (self.largeInfowindow.marker !== spot.marker) {
        //
        var content_html = '<div>' + spot.marker.title + '</div>';
        var pano_html = '<div id="pano"></div>';
        var foursquare_html = '<div><br>Foursquare shows no spots near here</div>';
        // console.log("infowindow.marker != marker");
        self.largeInfowindow.marker = spot.marker;
        // Open the content on the map
        self.largeInfowindow.open(MAP_GLOBAL, spot.marker);
        // Set up street view stuff
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;// 50 meters

        // Make sure the spots closeTo list is cleared
        while(spot.closeTo().length > 0){
          spot.closeTo.pop();
        }
        // Get any nearby locations and place them in the foursquare html
        this.queryFourSquare(spot, callbackFromFoursquare);
      }
    };

    /**
     * Display Directions
     * @description Information for browser based call can be found https://developers.google.com/maps/documentation/directions/
     * And for using the API from JavaScript, here:
     * https://developers.google.com/maps/documentation/javascript/directions
     * @param {type} toPosition
     * @returns {undefined}
     */
    this.displayDirections = function (toPosition) {
      self.hideSpots();
      //Get the destination address from the user entered value.
      var originAddress = self.timeSearchText();
      // Get the mode again from the user entered value
      var mode = self.selectedMode();
      directionsService.route({
        // The origin is the passed in marker's position
        origin: originAddress,
        // The destination is user entered address.destinationAddress
        destination: toPosition,
        travelMode: google.maps.TravelMode[mode]
      }, function (response, status) {
        // If the route is valid and call is successful...
        if (status === google.maps.DirectionsStatus.OK) {
          // Get a directions renderer to place the route on the map, could also
          //  show the directions by setting the 'panel' parameter with the
          //  html div that we want it to go to
          //  Show polyline of route.
          // multiple routes.
          var directionsDisplay = new google.maps.DirectionsRenderer({
            map: MAP_GLOBAL,
            directions: response,
            draggable: true,
            polylineOptions: {
              strokeColor: 'green'
            }
          });
          self.routes.push(directionsDisplay);
        } else {
          // Direction request failed, notify user
          window.alert('Directions request failed due to ' + status);
        }
      });

    };

  };// END VIEW MODEL
//
  /**
   * @description Toggle a sub menu section visible or hidden.
   * The menu section is considered to be the next element after the
   * one that is clicked.
   * @param {type} data
   * @param {type} event - element generating click event
   * @returns {undefined}
   */
  ViewModel.prototype.toggleSubMenu = function (data, event) {
    var self = this;
    // console.log("Toggle Sub-Menu: id = " + event.target.id);
    // Get the element following
    var sub = $(event.target).next();
    // Toggle its visibility
    $(sub).slideToggle(function () {
      // Get the value of the elements :visible object
      var isVis = $(sub).is(':visible');
      //
      var arrow = $(event.target).children('span');
      // If 
      if (isVis) {
        // console.log("----Visible");
        arrow.text(self.UPARROW);
      } else {
        arrow.text(self.DOWNARROW);
      }
    });
    //
    if (event.target.id === "nearby-h3")
    {
      // console.log("---Look for nearby spots.");
      // Clear nearbySpot list
      self.clearNearbyList();
      // If there are any favorites selected, check FourSquare
      self.spotList.forEach(function (spot) {
        if (spot.selected) {
          // console.log("--Nearby " + spot.name());

          // Call FourSquare to get nearby locations
          self.queryFourSquare(spot);
        }
      });

    }
  };

  /**
   * @description This function will make a custom marker, Using the supplied color as
   *  its base.
   * @param {object} markerColor - Hex color to make marker.
   */
  ViewModel.prototype.makeMarkerIcon = function (markerColor) {
    // This method of created an image is replaced in v3.10 of the Google Maps JavaScript API (see https://developers.google.com/maps/documentation/javascript/markers for mor detailse)
    var markerImage = new google.maps.MarkerImage(
            // place.icon url
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34)
            );
    return markerImage;
  };
  /**
   * @description Build a map marker for the targetted cool spot
   * @param {object[]} targetSpot - JSON object containing the spot infromation.
   */
  ViewModel.prototype.buildMarker = function (targetSpot) {
    var self = this;
    // Initialize a geocoder
    var geocoder = new google.maps.Geocoder();
    // Make sure the address isn't blank
    if (targetSpot.address() === '') {
      window.alert('Address: ' + targetSpot.address() + ', is not valid.');
    } else {
      // Geocode the address/area entered; want the center.
      geocoder.geocode(
              //keep within city
              {address: targetSpot.address()},
              // Center the map on location if an address or area is found
              function (results, status) {                
                if (status === google.maps.GeocoderStatus.OK) {
                  //
                  targetSpot.geoLocation(results[0].geometry.location);
                  //**
                  // Make an icon with the spots selected color
                  var icon = self.makeMarkerIcon(targetSpot.markerColor);
                  //**
                  // Create marker
                  var marker = new google.maps.Marker({
                    map: MAP_GLOBAL, // Add marker to global map when it's created
                    position: targetSpot.geoLocation(), // Location of marker on map
                    title: targetSpot.name(), // What will show when the marker is hovered over
                    icon: icon,
                    animation: google.maps.Animation.DROP // Shake the marker as it appears
                  });
                  // Make a contrasting icon for mouse hover over
                  var hoverOverIcon = self.makeMarkerIcon(targetSpot.markerHighlightColor);
                  // Add a mousover listener to change color on hover
                  marker.addListener('mouseover', function () {
                    // Change icon color
                    this.setIcon(hoverOverIcon);
                    // Emphasize the related menu list item
                    self.pulseMenuListItem(targetSpot.id);
                    // Stop the other bouncing
                    self.settleMarkers();
                  });
                  // Add a mouseout listener so the icon changes
                  // back when the mouse leaves
                  marker.addListener('mouseout', function () {
                    this.setIcon(icon);
                  });
                  // Add a click event listener to call the
                  marker.addListener('click', function () {
                    // info window function
                    // Show information about the target spot
                    self.populateInfoWindow(targetSpot);
                    // Make the marker bounce
                    targetSpot.marker.setAnimation(google.maps.Animation.BOUNCE);
                  });
                  // Add the marker to the spot
                  targetSpot.marker = marker;
                } else {
                  window.alert('Could not find that location - try entering a more specific place');
                }
              }
      );
    }
  };
  /**
   * @description Stop the bounce animation of any markers by changing 
   * Animation to Drop once.
   * @returns {undefined}
   */
  ViewModel.prototype.settleMarkers = function(){
    var self = this;
        // Stop the bounce - if any - of all other spots
    self.spotList.forEach(function (spot) {
      // If there is an animation clear it
      if (spot.marker.getAnimation() === google.maps.Animation.BOUNCE) {
        spot.marker.setAnimation(google.maps.Animation.DROP);
      }
    });
  };
  
  /**
   * @description Handle click events from 'Favourite spot list'
   * @param {object} spot - passed from click event handler, reference to a spotList element.
   */
  ViewModel.prototype.listClickHandler = function (spot) {
    var self = this;
    // Stop the bounce - if any - of all other spots
    self.settleMarkers();
    // Get visibility of spot
    var vis = spot.markerVisible();
    // Toggle marker to appear and bounce OR
    // Drop in
    this.shakeNameMarker(spot);
      // increment click count for this spot
      var clicks = spot.clickCount();
      spot.clickCount(++clicks);
    // If the spot's marker is already visible  
    if (!vis) { // Otherwise set its visibility to true
      //
      spot.markerVisible(true);
      // // console.log("Marker visible: " + spot.markerVisible());
    }
    // Show the spots information
    this.populateInfoWindow(spot);
  };
  /**
   * @description Called when the mouse leaves a menu list item, 
   * @param spot - the spot whose marker should be drawn attention to
   */
  ViewModel.prototype.menuListMouseout = function (spot) {
    // change the color of the marker
    if (spot.markerVisible()) {
      // Make an icon with the spots selected color
      var icon = this.makeMarkerIcon(spot.markerColor);
      // Set the icon to default color
      spot.marker.setIcon(icon);
    }
  };
  /**
   * @description Change the marker to its
   * highlight color.
   * Meant to be called on a mouseover event.
   * @param {object} spot - passed from click event
   * handler, reference to a spotList element.
   */
  ViewModel.prototype.menuListHover = function (spot) {
    // change the color of the marker
    if (spot.markerVisible()) {
      var icon = this.makeMarkerIcon(spot.markerHighlightColor);
      spot.marker.setIcon(icon);
    }
    //
    // // console.log('hover over ' + spot.name());
    //
    this.pulseMenuListItem(spot.id);
  };
  /**
   * @description Make the menu-list larger and
   * smaller by animation
   * @param id - menu list item id
   */
  ViewModel.prototype.pulseMenuListItem = function (id) {
    // Animate font larger
    $("#menu-list-" + id).animate({fontSize: "1.5em"});
    // Animate font to original size
    $("#menu-list-" + id).animate({fontSize: "1em"});
  };
  /**
   * @description Toggle the marker object to bounce or stop
   * bouncing each time it is called. Makes sure the marker is
   * on the map.
   * @param {object} spot - used to access marker object
   */
  ViewModel.prototype.shakeNameMarker = function (spot) {
    var self = this;
    // If the marker isn't presant on the map place it.
    if (!spot.marker.getMap()) {
      spot.marker.setMap(MAP_GLOBAL);
    }
    // If there is an animation clear it
//    if (spot.marker.getAnimation() === google.maps.Animation.BOUNCE) {
//      spot.marker.setAnimation(google.maps.Animation.DROP);
//    } else {
      // If not, add a bounce to the marker
      spot.marker.setAnimation(google.maps.Animation.BOUNCE);
      // Set the current spot
      self.currentSpot(self.spotList[spot.id]);
//    }
  };
  /**
   * @description Called to show cool spot
   * markers on the map. Uses the ViewModel
   * (self) spotList.
   */
  ViewModel.prototype.showSpots = function () {
    var mapBounds = new google.maps.LatLngBounds();
    // Go through the cool spot list and set the map for
    //  each marker
    this.spotList.forEach(function (spot) {
      spot.marker.setMap(MAP_GLOBAL);
      // Extend the boundry for the marker if necessary
      mapBounds.extend(spot.marker.position);
    });
    // Set the center of the map by getting the center of
    //  all of the cool spot list markers
    MAP_GLOBAL.setCenter(mapBounds.getCenter());
    // Set the bounds of the map by the marker postions
    MAP_GLOBAL.fitBounds(mapBounds);
  };
  /**
   * @description Called to hide cool spots
   */
  ViewModel.prototype.hideSpots = function () {
    this.spotList.forEach(function (spot) {
      spot.marker.setMap(null);
      // Re-set animation to drop in, when marker
      // is shown again.
      spot.marker.setAnimation(google.maps.Animation.DROP);
    });
  };
  /**
   * @description Hide markers that are sent
   * in an array. Sets each markers map object
   * to null.
   * @param {object[]} markers - an array of google map markers.
   */
  ViewModel.prototype.hideMarkers = function (markers) {
    // console.log("Hide Markers");
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
  };
  /**
   * @description Toggle Drawing function
   * Toggling the drawing manager
   *  Either starts drawing mode so user can
   *  draw a polyline box around an area of
   *  interst OR clears the box from the map.
   * Uses the viewModel drawingManager.
   */
  ViewModel.prototype.toggleDrawing = function () {
    var self = this;
    //  if there is a polygon
    if (this.drawingManager.map) {
      this.drawingManager.setMap(null);
      // Remove any polygon
      if (this.polygon) {
        this.polygon.setMap(null);
        // remove filter on spot list
        self.filteredSpotList.removeAll();
        // Add all spots to filtered spot List
        self.spotList.forEach(function (spot) {
          self.filteredSpotList.push(spot);
        });
      }
      // Set the button text
      this.sketchToggleValue(this.DRAWPOLY);
    } else {
      // Place drawing manager on the map
      this.drawingManager.setMap(MAP_GLOBAL);
      // Set the button text 
      this.sketchToggleValue(this.CLEARPOLY);
    }
  };
  /**
   * @description Zoom to area function
   * Zoom to an area selected by user; it
   * gets the users input from the zoom
   * to area text box then geocodes it for
   * lat/long information
   */
  ViewModel.prototype.zoomToArea = function () {
    var self = this;
    // Initialize a geocoder
    // console.log("zoom To Area");
    var geocoder = new google.maps.Geocoder();
    // Get the address to zoom to
    // Make sure the address isn't blank
    if (this.timeSearchText() === '') {
      // Alert user if there is nothing in
      // the timeSearchText text box
      window.alert('Please ad an area or address');
    } else {
      // console.log('Zoom Caption:' + self.zoomText() + ' w ' + this.ZOOMOUT);
      // If zoom button doesn't say zoom out

      // Geocode the address/area entered; want the center.
      geocoder.geocode(
              {address: this.timeSearchText()
              }, function (results, status) {
        // Center the map on location if an address or area is found
        if (status == google.maps.GeocoderStatus.OK) {
          // console.log("    location " + results[0].geometry.location);
          //
          MAP_GLOBAL.setCenter(results[0].geometry.location);
          if (!self.zoomed) {
            self.zoomed = true;
            // then Zoom In
            self.zoomText = self.ZOOMOUT;
            // If zooming in
            MAP_GLOBAL.setZoom(16);//zoom to street level
            // otherwise zoom back
          } else {// Zoom out
            self.zoomed = false;
            //
            self.zoomText = (self.ZOOMIN);
            //
            MAP_GLOBAL.setZoom(13);// zoom to city level
          }
        } else {
          // Alert the user if the status is anything but OK
          window.alert('Could not find that location - try entering a more specific place');
        }
      }
      );

      //
    }
  };
  /**
   * @description Display markers within time/distance. As filtered by the calling function.
   *  This is a refactored version of the course example.
   * @param {objec} self - 'this' of the ViewModel object, should not be necessary; find a more
   * elegant solution later.
   * @param {object[]} response - result of a call to distanceMatrixService.getDistanceMatrix.
   * Sent to a callback function which calls this one.
   */
  ViewModel.prototype.displayMarkersWithinTime = function (response) {
    /**
     * As this is in a prototype for ViewModel, 'this' is
     * ViewModel, so create 'self' for clarity.
     * @type ViewModel
     */
    var self = this;
    var origins = response.originAddresses;
    // console.log("----display markers>>Origin " + origins[0]);
    var destinations = response.destinationAddresses;
    // console.log("----display markers>>Destination 1: " + destinations[0]);
    //
    var atLeastOne = false;
    // Incrementing reference to identify marker
    // that is within the time range selected
    var i = 0;
    // Go through each response address and compare the time it
    //  takes
    response.rows.forEach(function (results) {
      // Get a map boundry object
      var mapBounds = new google.maps.LatLngBounds();
      // Go through all the elements to see if there is a valid result
      results.elements.forEach(function (result) {
        // The distance .value is returned in feet - set by the UnitSystem parameter - but the .text is in miles.
        //  if you want to change the logic to show markers in a distance, you need the value for distance; 'result.distance.value' only need text here tho.
        var distanceText = null;
        // Make sure the result has a distance
        if (result.distance) {
          distanceText = result.distance.text;
        } else {
          // If not, Skip the rest, there is no valid result and alert the user.
          window.alert("There are no cool spots in that area.");
          return;
        }
        // Duration value is given in seconds, convert to minutes.
        var duration = result.duration.value / 60;
        // Also need the duration text
        var durationText = result.duration.text;
        // If the route duration is less than the selected time
        // console.log("  selected Time: " + self.selectedTime());
        if (duration <= self.selectedTime()) {
          
          // set the marker for this result.
          // indavidual marker, to be used later in this function as well.
          var marker = null;
          if (i < self.spotList.length) {
            marker = self.spotList[i].marker;
            marker.setMap(MAP_GLOBAL);
            // Expand the map to include this marker
            // Ref: https://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
            mapBounds.extend(marker.position);
          }
          //
          // Obviously at least one marker is within range
          atLeastOne = true;
          // Create a mini infowindow to open immediately and
          //  contain the distance and duration
          var infowindow = new google.maps.InfoWindow({
            content: durationText + ' away, about ' + distanceText +
                    '<div><button type=\"button\" id=\"display-directions\" onClick=' +
                    '\"view_model.displayDirections(&quot;' + destinations[i] + '&quot;);\">View Route</button></div>'
          });

          // Assign this local infowindow to the marker so the marker will be re-shown on the larger infowindow
          //  if the view changes.
          //  The reason to use markers[] instead of marker is because marker is local and markers[] is the actual global value.
          if (marker) {
            // Assign the infowindow to the indicated
            // spotList element
            self.spotList[i].marker.infowindow = infowindow;
            // event listener for infowindow click, to close this local infowindow.
            google.maps.event.addListener(marker, 'click', function () {
              marker.infowindow.close();
            });

          }
          // Show the marker
          infowindow.open(MAP_GLOBAL, marker);
        }
        // increment i for marker selection
        i = i + 1;
      });
      // Show all the markers on the map
      MAP_GLOBAL.fitBounds(mapBounds);
    });
    //
    if (!atLeastOne) {
      // Alert user that there wasn't any good results found
      window.alert('Sorry, nothing found within your selected time window.');
    }

  };

  /**
   * @description Search inside the polygon, set the callback function for 
   * when the polygon is moved, and sets the filtered list to those within
   * the polygon.
   * @returns {undefined}
   */
  ViewModel.prototype.searchWithinPolygon = function () {
    var self = this;
    //
    var tempFilteredList = [];
    // Check list to see if any spots are within polygon
    self.spotList.forEach(function (spot) {
      // console.log(" Search Within Poly: target " + spot.name());
      // Check if the markers position is inside the global polygon area
      if (google.maps.geometry.poly.containsLocation(spot.marker.position, self.polygon)) {
        spot.marker.setMap(MAP_GLOBAL);// its inside so add it to the map
        //
        self.spotTitle(self.defaultSpotTitle + ' (filtered)');
        //
        tempFilteredList.push(spot);
      } else {
        spot.marker.setMap(null);// its not inside so remove it
      }
    });
    // 
    if (tempFilteredList.length > 0) {
      //
      self.spotTitle(self.defaultSpotTitle + ' (filtered)');
      // Clear the filtered spot array
      self.filteredSpotList.removeAll();
      // Add the list inside the polygon
      tempFilteredList.forEach(function (fspot) {
        //
        self.filteredSpotList.push(fspot);
      });
    }
  };
  /**
   * @description Search for cool spots within a given time
   * from a location given by user. User can also supply mode of travel.
   * @returns {undefined}
   */
  ViewModel.prototype.searchWithinTime = function () {
    //
    var self = this;
    // Initialize the distance matrix
    var distanceMatrixService = new google.maps.DistanceMatrixService();
    // Get the address entered by user
    // Check to make sure the address isn't blank
    if (this.timeSearchText() === '') {
      // Alert the user that there is nothing
      // in the search by time text box.
      window.alert('You need to enter an address');
    } else {
      // console.log(" Search Within Time");
      // Hide all cool spot markers first.
      this.hideSpots();
      // Use the distance matrix service to calculate the duration of the
      //  routes between all the markers (destination), and the origin address
      //  entered by the user.

      var destinations = [];
      this.spotList.forEach(function (spot) {
        // Put all the origins into an origin matrix
        destinations.push(spot.marker.position);
      });
      // address/area given by user is where to start the route from
      var origin = this.timeSearchText();
      // Mode of travel
      var mode = this.selectedMode();
      //
      // Call the google distance matrix service;
      //  Find the how to here: https://developers.google.com/maps/documentation/javascript/distancematrix
      distanceMatrixService.getDistanceMatrix({
        origins: [origin],
        destinations: destinations,
        travelMode: google.maps.TravelMode[mode],
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, function (response, status) {
        // This is the callback function that results will be sent to
        //
        if (status !== google.maps.DistanceMatrixStatus.OK) {
          // Alert user there was an error and what it was
          window.alert("Error was: " + status);
        } else {
          var originList = response.originAddresses;
          var destinationList = response.destinationAddresses;
          // console.log("Origin test: " + originList[0]);
          // console.log("Destination test: " + destinationList[0]);
          // Display all markers that are within the
          // given time period
          self.displayMarkersWithinTime(response);
        }
      });

    }
  };
  /**
   * @description Clear Directions off the map
   */
  ViewModel.prototype.clearRoutes = function () {
    this.routes().forEach(function (route) {
      // Remove route markers
      route.setOptions({suppressMarkers: true});// without this, the markers remain after route is deleted.
      // Remove route from map
      route.setMap(null);
    });
    // Clean all routes from array.
    this.routes.removeAll();
    //

  };


  /**
   * @description Create markers for all places that are searched for
   * @param {type} places - An array of objects containing place marker 
   * information; icon, name, geometry, place_id,
   * @returns {undefined}
   */
  ViewModel.prototype.createMarkersForPlaces = function (places) {
    var self = this;
    // console.log("Create Markers for Places");
    var mapBounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      // Marker icon parameters
      var icon = {
        url: place.icon, // special icon
        size: new google.maps.Size(35, 35),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      // Create a marker
      var marker = new google.maps.Marker({
        map: MAP_GLOBAL,
        icon: icon,
        title: place.name,
        position: place.geometry.location,
        id: place.place_id
      });
      // Info window for place search result information details
      var placeInfoWindow = new google.maps.InfoWindow();
      // Event listener for when the marker is clicked
      marker.addListener('click', function () {
        if (placeInfoWindow.marker === this) {
          // console.log("This infowindow already is on this marker");
        } else {
          // Get the details for the place that this marker is related to
          getPlacesDetails(this, placeInfoWindow);
        }
      });
      // Add markers to the placeMarker array
      self.placeMarkers().push(marker);
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        mapBounds.union(place.geometry.viewport);
      } else {// adjust map bounds if necessary to acomadate results
        mapBounds.extend(place.geometry.location);
      }
      // Move the center of the map to the marker that
      //  is in the middle of of the grouping
      MAP_GLOBAL.setCenter(mapBounds.getCenter());
      // Make sure the map shows all markers
      MAP_GLOBAL.fitBounds(mapBounds);
    });
  };
  /**
   * @description Call the FourSquare API for more information
   * @param {type} querySpot to query Foursquare API on
   * @param {function} callback function to call when query finishes, 
   * default is null
   * @returns {undefined}
   */
  ViewModel.prototype.queryFourSquare = function (querySpot, callback) {
    var self = this;
    // FourSquare access credentials
    var client_id = "INWUJQCSABPNKFZPFSG1L1023VTHBFWBP4YZCUXUFQEO01MW";
    var client_secret = "T5RHEMNEQBGGQ4ZYF5ESD4NA1J20OWGD5IWTFYT5R4N21JZX";
    // Version date of access credentials
    var ver = "20161016";
    // Query type
    var query = "";
    // Location
    var location = querySpot.marker.position.lat() + "," + querySpot.marker.position.lng();//"41.878114,87.629798";
    // console.log("Location: " + location);
    var url = "https://api.foursquare.com/v2/venues/search";
    //https://api.foursquare.com/v2/venues/search?v=20161016&ll=41.878114%2C%20-87.629798&query=coffee&intent=checkin&client_id=INWUJQCSABPNKFZPFSG1L1023VTHBFWBP4YZCUXUFQEO01MW&client_secret=T5RHEMNEQBGGQ4ZYF5ESD4NA1J20OWGD5IWTFYT5R4N21JZX
    // Possible intents: checkin, match
    $.getJSON(url, {
      "v": ver,
      "ll": location,
      "query": query,
      "limit": 5,
      "intent": "checkin",
      "client_id": client_id,
      "client_secret": client_secret
    }).done(function (data) {
      // console.log("hello: " + data.meta.code);
      // If there is data to look at in venues, parse it
      if (data.response.venues.length > 0) {
        // For each response ad to the nearby spots
        data.response.venues.forEach(function (venue) {
          // console.log("Name: " + venue.name);
          // console.log(venue.location.distance + " from ");
          var category_name = "No Category";
          if (venue.categories.length > 0)
          {
            // console.log("Known as ");
            venue.categories.forEach(function (category) {
              console.log("- " + category.name);
              category_name = category.name;
            });
          }
          //
          var nearbySpot = {
            name: venue.name,
            type: category_name, //venue.categories[0].name,
            address: venue.location.address,
            geoLocation: venue.location.lat + "," + venue.location.lng,
            imgSrc: '',
            imgAttribution: ''
          };
          // nearbySpot
          self.addNearbySpots(nearbySpot);
          //
          querySpot.closeTo.push(nearbySpot);
        });
      } else { // indicate no data available
        window.alert("Sorry there was no information available for that search.");
      }

      // Notify the callback function on completion of data mining.
      if (callback !== null)
      {
        callback();
      }
    }).fail(function(jqxhr, textStatus, error){
      var err = textStatus + ", " + error;
      window.alert("Sorry there was an error in the Foursquare query: "+ err);
    });
  };
  


  /**
   * @description Entry point for Neighborhood Map
   */
  ko.applyBindings(new ViewModel());



