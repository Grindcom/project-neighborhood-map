# Neighborhood Map
A single page application utilizing the google maps API (and others) to showcase my town.  This a project for the UDacity Front-end Developer course.

## How to use
This app starts with a google map located at Williams Lake, BC - including a marker at the center of the town as well as several pre-loaded cool spots.  
There is a hidden, slideout menu that can be accessed by a standard 'hamburger' button in the top right of the page.  

Once the slideout menu is toggled open, the user will see dropdown menu lists of cool spots as well as multiple ways to explore the 'Puddle' 
for fun things to do.  


### Cool Features
* Clear or show all the markers with a click of the appropriate button.
* A click count is maintained for the favorite spot list.  Every time the list item is clicked the counter goes up.
### Search
The search options available include:  
* Sketch a polygon around an area in the map.
* Enter an area you want to zoom in to.  This becomes your origin point for the next search feature.
* Select time and mode of travel, using the drop down boxes (in the 'find the route from' area).

#### How search works
1. Show all the cool spot markers at once; they will drop in from the top of the map.  
2. Sketch out an area of interest to see if there are any cool spots inside it;
  1. If there are any markers outside the sketch they will either be hidden or not shown.
  2. When toggled off the sketch will be removed, but the markers will be left in place.
3. Search by an area; enter an area of interest in the text box then click zoom to swoop in to the zone.
4. Select one of the listed cool spots;
    1. If all markers are showing, the selected spots' marker will bounce.
    2. If the markers aren't showing, the spots' marker will drop onto the map and start bouncing.
    3. If a spot's marker is bouncing, selecting it again will stop it.

## Requirements

### Libraries, Frameworks and API's
#### Must use the following:
1. [Knockout.js](http://knockoutjs.com/)

#### Also using:
1. [jQuery.js](https://jquery.com/)
2. [slideout.js](https://github.com/Mango/slideout)

#### API's
1. GoogleMaps API
2. [Foursquare API](https://developer.foursquare.com/start)


### Must do's
1. [x] Track click events on list items using Knockout.js
2. [x] Create markers as part of the ViewModel (as observables is not permitted)
3. [x] All API's must be loaded asynchronously.
4. [x] Error handling must be handled gracefully (including 3rd party API access issues); any of the following are recommened;
  1. [x] "A message is displayed notifying the user that the data can't be loaded"(UDacity project details)  
  2. [ ] "There are no negative repercussions to the UI"(UDacity project details)
  3. [ ] [Special error handling](http://api.jquery.com/jquery.ajax/#jqXHR)
  4. [ ] [Block websites](http://www.digitaltrends.com/computing/how-to-block-a-website/) that may cause issues
  5. [ ] [Learn more here](http://ruben.verborgh.org/blog/2012/12/31/asynchronous-error-handling-in-javascript/)
5. [x] Add a full-screen map using Google Maps API; only call map API once
6. [x] Write code to display map markers,
  1. [x] With at least 5 locations of interest; displayed by default.
7. [x] Implement a list view of the above 5 locations  
8. [ ] Provide a filter option that
  1. [x] Uses an input field to filter the list view and the map markers that are displayed
  2. [x] The list view and the markers should update accordingly in real time.
  3. [x] May be a text input or a dropdown menu
9. [ ] Add functionality with third-party API's (at least one)
  1. [ ] Provide information when a map marker or list view entry is clicked
    1. [ ] Yelp reviews
    2. [ ] Wikipedia
    3. [ ] Flickr images
    4. [x] Foursquare
    5. [ ] [Instagram] (https://www.instagram.com/developer/authentication/)
    6. [ ] etc.
  2. [ ] Google maps libraries like StreetView and Places do not count
10. [x] Add functionality to animate a map marker when either the list item associated with it or the map marker itself is selected.
11. [x] Add functionality to open an info window with the information described in step 9.1
  1. [x] When a location is selected from the list view
  2. [x] When a marker on the map is selected
  3. [ ] Optionally - as an addition - the information can populate a DOM element
12. [ ] The app's interface must be intuitive to use.
  1. [ ] Input text area to filter locations should be easy to locate
  2. [ ] It should be easy to understand what set of locations is being filtered
  3. [x] Selecting a location via list item or map marker should cause the related map marker to bounce *OR* **animate** in some way to catch the users attention
  4. [x] Associated info window should open above the map marker with additional information
