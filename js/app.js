// Neighborhood Map project
// Main JavaScript
// Author: Greg Ford, B.Sc.
// Start Date: Dec. 13, 2016

// ******************
// Favorite locations
var favSpots = [{
  name: 'Oliver Street Bar and Grill'
},{
  name: 'Mings Palace'
}]
//*******************
var CoolSpot = function(data){

}

//*******************
var ViewModel = function(){
  var self = this;
  //
  this.locationList = ko.observableArray([]);
  favLocations.forEach(function(location){
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
