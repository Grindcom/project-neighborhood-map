# Neighborhood Map
A single page application utilizing the google maps API (and others) to showcase my town.  This a project for the UDacity Front-end Developer course.

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
1. Track click events on list items using Knockout.js
2. Create markers as part of the ViewModel (as observables is not permitted)
3. All API's must be loaded asynchronously.
4. Error handling must be handled gracefully (including 3rd party API access issues); any of the following are recommened;
  1. "A message is displayed notifying the user that the data can't be loaded"(UDacity project details)  
  2. "There are no negative repercussions to the UI"(UDacity project details)
  3. [Special error handling](http://api.jquery.com/jquery.ajax/#jqXHR)
  4. [Block websites](http://www.digitaltrends.com/computing/how-to-block-a-website/) that may cause issues
  5. [Learn more here](http://ruben.verborgh.org/blog/2012/12/31/asynchronous-error-handling-in-javascript/)
5. Add a full-screen map using Google Maps API; only call map API once
6. Write code to display map markers,
  1. With at least 5 locations of interest; displayed by default.
7. Implement a list view of the above 5 locations  
8. Provide a filter option that
  1. Uses an input field to filter the list view and the map markers that are displayed
  2. The list view and the markers should update accordingly in real time.
  3. May be a text input or a dropdown menu
9. Add functionality with third-party API's
  1. Provide information when a map marker or list view entry is clicked
    1. Yelp reviews
    2. Wikipedia
    3. Flickr images
    4. Foursquare
    5. etc.
  2. Google maps libraries like StreetView and Places do not count
10. Add functionality to animate a map marker when either the list item associated with it or the map marker itself is selected.
11. Add functionality to open an infoWindow with the information described in step 9.1
  1. When a location is selected from the list view
  2. When a marker on the map is selected
  3. Optionally - as an addition - the information can populate a DOM element
12. The app's interface must be intuitive to use.
  1. Input text area to filter locations should be easy to locate
  2. It should be easy to understand what set of locations is being filtered
  3. Selecting a location via list item or map marker should cause the related map marker to bounce *OR* **animate** in some way to catch the users attention
  4. Associated info window should open above the map marker with additional information
