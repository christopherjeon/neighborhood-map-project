//List of restaurants in downtown Vancouver
var restaurants  = [
  {
    name: "Miku",
    lat: 49.2870468,
    lng:  -123.1128433,
    venueid: "4aa7f561f964a520384e20e3",
    show: true,
    selected: false
  },
  {
    name: "Zefferelli's",
    lat: 49.285039,
    lng: -123.1260593,
    venueid: "4aa82da4f964a520db4f20e3",
    show: true,
    selected: false
  },
  {
    name: "Minami",
    lat: 49.2753345,
    lng: -123.120724,
    venueid: "4fac04c2e4b0685b5b224d9d",
    show: true,
    selected: false
  },
  {
    name: "Gotham Steakhouse",
    lat: 49.282868,
    lng: -123.11585,
    venueid:"4aa7f22bf964a520214e20e3",
    show: true,
    selected: false
  },
  {
    name: "Hy's",
    lat: 49.284641,
    lng: -123.1193075,
    venueid:"4bfdb7bcf61dc9b6bb7a9fde",
    show: true,
    selected: false
  },
  {
    name: "Kobe",
    lat: 49.2845269,
    lng: -123.122775,
    venueid:"4af8eddbf964a520981022e3",
    show: true,
    selected: false
  },
  {
    name: "Joey Burrard",
    lat: 49.282606,
    lng: -123.1231879,
    venueid:"4aa17172f964a520904020e3",
    show: true,
    selected: false

  },
  {
    name: "Shabusen",
    lat: 49.2839983,
    lng: -123.1223368,
    venueid:"4aa81ae3f964a520594f20e3",
    show: true,
    selected: false
  },
  {
    name: "Meat and Bread",
    lat: 49.2826215,
    lng: -123.109359,
    venueid:"4cc72e8b01fb236a8d70bbba",
    show: true,
    selected: false
  },
  {
    name: "Japadog",
    lat: 49.280251700000015,
    lng: -123.1183271,
    venueid:"4b5fa47ff964a52000c629e3",
    show: true,
    selected: false
  },
  {
    name: "Stepho's",
    lat: 49.2807441,
    lng: -123.1319603,
    venueid:"4abc5e72f964a520148720e3",
    show: true,
    selected: false
  }
];

// Initializing map here
var map;

function initMap() {
  //Create styles array
  var styles = [
    {
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#1f54a8' },
        { weight: 5 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#ffffff' }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 6 },
        { hue: '#1be5b6'}
      ]
    },{
      featureType: 'poi.attraction',
      elementType: 'geometry',
      stylers: [
        { visibility: 'on'},
        { color: '#04e072'}
      ]
    },{
      featureType: 'water',
      stylers: [
        { color: '#0493e0' }
      ]
    }
  ];

  //Constructor creating new map of Vancouver
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 49.2827291, lng: -123.1207375},
    styles: styles,
    zoom: 15
  });
  var bounds = new google.maps.LatLngBounds();

  infoWindow = new google.maps.InfoWindow();

  ko.applyBindings(new ViewModel());
}

// Restaurant Variable
var Restaurant = function(data,vm){
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.venueid = data.venueid;
  this.show = ko.observable(data.show);
  this.selected = ko.observable(data.selected);
  this.marker = new google.maps.Marker({
    map: map,
    name: data.name,
    position: {lat: data.lat, lng: data.lng},
    venueid: data.venueid,
    show: data.show,
    selected: data.selected,
    animation: google.maps.Animation.DROP
  });


  this.marker.addListener('click',function(){
    vm.addApiInfo(this, vm.infoWindow);
  });

};

// ViewModel
var ViewModel = function(){



  var self = this;

  self.infoWindow = new google.maps.InfoWindow();

  self.restaurantList = ko.observableArray([]);

  self.errorMessage = ko.observable('');

  self.filterText = ko.observable('');

  restaurants.forEach(function(data){
    self.restaurantList.push(new Restaurant(data, self));
  });

  // Storing the length of restaurantList in a variable
  self.listLength = self.restaurantList().length;

  // Either showing or not showing all restaurants
  self.allVisible = function(showBoolean) {
    for(var i=0; i<self.listLength; i++){
      self.restaurantList()[i].show(showBoolean);
      self.restaurantList()[i].marker.setVisible(showBoolean);
    }
  };

  // Unselecting each restaurant
  self.unselectAll = function(){
    for(var i=0; i<self.listLength; i++){
      self.restaurantList()[i].selected(false);
    }
  };
  // Foursquare API info that can put into a marker window
  self.makeInfoWindowContent = function(data) {
    var address = data.location.formattedAddress;
    var name = data.name;
    var price = "Price Description: " + data.price.message;
    var rating = "Rating: " + data.rating + "/10";
    var likes = "Number of Likes: " + data.likes.count;

    var filledInfoWindow = '<div class="info-window"><h3>' + name + '</h3>'  +
                              '<div>' + price + '</div>' +
                              '<div>' + rating + '</div>' +
                              '<div>' + likes + '</div></div>';
    return filledInfoWindow;
  };

  self.defaultColor = function(){
    for(var i=0; i<self.listLength; i++){
      self.restaurantList()[i].marker.setIcon('https://www.google.com/mapfiles/marker_orange.png');
    }
  };

  // Change color of marker to green when selected from list
  self.changeMarkerColor = function(marker){
     marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
  };

  self.defaultColor();

  // Credit: Udacity forums
  // https://discussions.udacity.com/t/cant-get-foursquare-api-to-work/259270/12
  self.addApiInfo = function(marker, infoWindow){
    $.ajax({
      url:"https://api.foursquare.com/v2/venues/" + marker.venueid + '?client_id=GMVLZD4H3PHTYKPJCLQFKCEFIM2F3GBPFRKRFXV5ABZSM32J&client_secret=TXGLD5DGPJJ40N1GZNEVDLQEIKIFMP2CQQ42HROAH1ICG40Y&v=20161016',
      dataType: "json",
      success: function(data) {
        var result = data.response.venue;
        self.defaultColor();
        infoWindow.setContent(self.makeInfoWindowContent(result));
        infoWindow.open(map, marker);
        // Turn green when clicked on
        marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
      },
      error: function(e){
        self.errorMessage("<p><b>An error occured. Please try again later!</b><p>");
      }
    });
  };



  // KnockOut observable for filter text
  self.userInput = ko.observable('');

  self.applyFilter = ko.computed(function(){
    infoWindow.close();
    var searchInput = self.filterText().toLowerCase();
    // show all restaurants if nothing is in the filter search
    if(searchInput.length === 0){
      self.allVisible(true);
    }
    else{
      for(var i=0; i<self.listLength; i++){
        // https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
        var name = self.restaurantList()[i].name.toLowerCase();

        var match = name.indexOf(searchInput) !== -1; // true or false

        self.restaurantList()[i].show(match);
        self.restaurantList()[i].marker.setVisible(match);
      }
    }
  });

  self.setSelected = function(restaurant){
    self.unselectAll();
    self.defaultColor();
    restaurant.selected(true);
    //Credit: Sarah from 1 on 1 Udacity sessions
    google.maps.event.trigger(restaurant.marker,'click');
    self.changeMarkerColor(restaurant.marker);
  };
};

// Error handler for Google Maps
// Credit: Sarah
function myerrorhandler() {
    alert("Google Maps did not load");
  }
