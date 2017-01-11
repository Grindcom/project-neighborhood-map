// This creates a Knockout component called 'directions-widget'
// It can be used as an html element like <directions-widget></directions-widget>

ko.components.register('directions-widget',{
  viewModel: function(position){
    console.log("Directions Widget: "+position.value);
    this.chosenPosition = position.value;
    //
    this.name = ko.observable('Hi!!!');
    //
    this.showDirections = function(){ console.log("  Show Directions");}.bind(this);
  },
  template:
  '<div class="directions">\
  <button data-bind="click: showDirections, text: name">Like it</button>\
  </div>\
  <div class="result" data-bind="visible: chosenPosition">\
  You <strong data-bind="text: chosenPosition"></strong> it\
  </div>'
});
