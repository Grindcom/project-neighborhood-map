// Neighborhood Map project
// Main JavaScript
// Author: Greg Ford, B.Sc.
// Start Date: Dec. 13, 2016

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
  address: '180 3 Ave N, Williams Lake, BC',
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
  address: '1730A Broadway Ave S, Williams Lake, BC',
  geoLocation: '',
  reviews: [],
  imgSrc: '',
  imgAttribution: ''
}]
//*******************
var CoolSpot = function(data){
  console.log("    CoolSpot");
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
  // TODO: Add computed observables; get more information about this spot. 
}

//*******************
var ViewModel = function(){
  console.log("ViewModel");
  var self = this;
  //
  this.locationList = ko.observableArray([]);
  favSpots.forEach(function(location){
    console.log("  favSpots");
    self.locationList.push(new CoolSpot(location));
  });
  // Set the Current cool spot
  this.currentSpot = ko.observable(this.locationList()[0]);
  //
  this.initMap = function(map){
    console.log(" Map: "+map);
  };
}

ko.applyBindings(new ViewModel());
