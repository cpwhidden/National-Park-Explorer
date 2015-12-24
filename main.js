// Refactor to separate model file
var Park = function(name, lat, long) {
	this.name = name;
	this.lat = lat;
	this.long = long;

}

// National Park Service will be releasing API in January 2016.  
// Check again in future to automate and gather more park info instead of hardcoding here.
// Data below comes from Wikipedia article List of US National Parks
var nationalParkList = [new Park('Acadia', 44.35, -68.21),
						new Park('American Samoa', -14.25, -170.68),
						new Park('Arches', 38.68, -109.57),
						new Park('Badlands', 43.75, -102.50),
						new Park('Big Bend', 29.25, -103.25),
						new Park('Biscayne', 25.65, -80.08),
						new Park('Black Canyon', 38.57, -107.72),
						new Park('Bryce Canyon', 37.57, -112.18),
						new Park('Canyonlands', 38.2, -109.93),
						new Park('Capitol Reef', 38.2, -111.17),
						new Park('Carlsbad Caverns', 32.17, -104.44),
						new Park('Channel Islands', 34.01, -119.42),
						new Park('Congaree', 33.78, -80.78),
						new Park('Crater Lake', 42.94, -122.1),
						new Park('Cuyahooga Valley', 41.24, -81.55),
						new Park('Death Valley', 36.24, -116.82),
						new Park('Denali', 63.33, -150.50),
						new Park('Dry Tortugas', 24.63, -82.87),
						new Park('Everglades', 25.32, -80.93),
						new Park('Gates of the Artic', 67.78, -153.3),
						new Park('Glacier', 48.8, -114),
						new Park('Glacier Bay', 58.5, -137),
						new Park('Grand Canyon', 36.06, -112.14),
						new Park('Grand Teton', 43.73, -110.8),
						new Park('Great Basin', 38.98, -114.3),
						new Park('Great Sand Dunes', 37.73, -105.51),
						new Park('Great Smoky Mountains', 35.68, -83.53),
						new Park('Guadalupe Mountains', 31.92, -104.87),
						new Park('Haleakalā', 20.72, -156.17),
						new Park('Hawaii Volcanoes', 19.38, -155.2),
						new Park('Hot Springs', 34.51, -93.05),
						new Park('Isle Royale', 48.1, -88.55),
						new Park('Joshua Tree', 33.79, -115.9),
						new Park('Katmai', 58.5, -155),
						new Park('Kenai Fjords', 59.92, -149.65),
						new Park('Kings Canyon', 36.8, -118.55),
						new Park('Kobuk Valley', 67.55, -159.28),
						new Park('Lake Clark', 60.97, -153.42),
						new Park('Lassen Volcanic', 40.49, -121.51),
						new Park('Mesa Verde', 37.18, -108.49),
						new Park('Mount Rainier', 46.85, -121.75),
						new Park('North Cascades', 48.7, -121.2),
						new Park('Olympic', 47.97, -123.5),
						new Park('Petrified Forest', 35.07, -109.78),
						new Park('Pinnacles', 36.48, -121.16),
						new Park('Redwood', 41.3, -124),
						new Park('Rocky Mountain', 40.4, -105.58),
						new Park('Saguaro', 32.25, -110.5),
						new Park('Sequoia', 36.43, -118.68),
						new Park('Shenandoah', 38.53, -78.35),
						new Park('Theodore Roosevelt', 46.97, -103.45),
						new Park('Virgin Islands', 18.33, -64.73),
						new Park('Voyageurs', 48.50, -92.88),
						new Park('Wind Cave', 43.57, -103.48),
						new Park('Wrangell – St. Elias', 61, -142),
						new Park('Yellowstone', 44.6, -110.5),
						new Park('Yosemite', 37.83, -119.5),
						new Park('Zion', 37.3, -113.05)];

// Data structure to describe API requests
var API = function(name, enabled, iconURL, request) {
	var self = this;
	this.name = ko.observable(name);
	this.enabled = ko.observable(enabled);
	this.iconURL = iconURL;
	this.request = request;
	this.requestToken;
	this.defaultHTML = '<div class="api-header"><img class="api-icon" src="' + this.iconURL + '"></img><h2>Waiting for photos</h2><hr></div>';
	this.htmlString = ko.observable(self.defaultHTML);
}

var apis = [new API('Flickr', true, 'images/flickr.png', function(lat, lon) {
	var self = this;
	self.requestToken = $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6292fdf93c1a3e4947455f9d710fd0d2&format=json&nojsoncallback=1&lat=' + lat + '&lon=' + lon + '&radius=10', function(data){
		// Inject HTML into api div
		console.log(data);
		if (data.photos.photo.length > 0) {
			var pictureCount = Math.min(data.photos.photo.length, 5);
			console.log(pictureCount);
			var html = '<div id="flickr-photos">';
			for (var i = 0; i < pictureCount; i++) {
				console.log(i);
				var farm = data.photos.photo[i].farm;
				var server = data.photos.photo[i].server;
				var id = data.photos.photo[i].id;
				var secret = data.photos.photo[i].secret;
				html += '<img src=https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '.jpg</img>';
			}
			html += '</div>';
			self.htmlString('<div class="api-header"><img class="api-icon" src="' + self.iconURL + '"></img><h2>Flickr</h2></div><hr>' + html);
			console.log(self.htmlString());
		}
	}).error(function(jqXHR, status, error) {
		self.htmlString('Error getting photos');
	});
})];

var Model = function() {
	var self = this;
	this.currentSearch = ko.observable("US National Parks");
	this.filterString = ko.observable("");
	this.parkList = ko.observableArray(nationalParkList);
	this.filteredParks = ko.computed(function() {
		return this.parkList().filter(function(element) {
			return (element.name.toLowerCase().indexOf(this.filterString().toLowerCase()) > -1);
		}, this);		
	}, this);

	// Find bounds for map based on latitude and longitude of parks
	this.bounds = ko.computed(function() {
		var list;
		if (self.filteredParks().length == 0) {
			list = self.parkList();
		} else {
			list = self.filteredParks();
		}
		var lats = [];
		var longs = [];
		for (i in list) {
			lats.push(list[i].lat);
			longs.push(list[i].long);
		}

		// Extend latitude and longitude by one degree in each direction to give a margin on the map
		var bounds = {west: Math.min.apply(null, longs) - 1, east: Math.max.apply(null, longs) + 1, north: Math.max.apply(null, lats) + 1, south: Math.min.apply(null, lats) - 1};
		return bounds;
	})
	this.selectedResultIndex = ko.observable(null);
	this.apiList = ko.observableArray(apis);

}

var ViewModel = function() {
	this.model = ko.observable(new Model());
	this.markers = [];
	var self = this;
	self.currentParkName;
	var map, infoWindow;

	this.infoWindowContent = ko.pureComputed(function() {
		var htmlString = '<div id="info-window-content"><h1 class="park-info-window-title">' + self.currentParkName + '<small>National Park</small></h1>';
		var apiList = self.model().apiList();
		for (api in apiList) {
			if (apiList[api].enabled() == true) {
				htmlString += '<div class="api-item info-window-container">';
				htmlString += apiList[api].htmlString();
				htmlString += '</div>';
			}
		}
		htmlString += '</div>';
		return htmlString;
	})

	this.initMap = function() {
		self.map = new google.maps.Map(document.getElementById('map'), {
			mapTypeControlOptions: {position: google.maps.ControlPosition.TOP_RIGHT}
		});

		self.adjustBounds();
		self.createMarkers(self.model().filteredParks());
		self.infoWindow = new google.maps.InfoWindow({content: self.infoWindowContent()});
		
		window.onresize = function(event) {
			self.adjustBounds();
		};
		$(document).on('fullscreenchange', function() {
			self.adjustBounds();
		});

	}

	this.adjustBounds = function() {
		var bounds = self.model().bounds();
		self.map.fitBounds(bounds);
	}

	this.removeAllMarkers = function() {
		for (marker in self.markers) {
			self.markers[marker].setMap(null);
		}
		self.markers = [];
	}

	this.createMarker = function(title, lat, long) {
		var marker = new google.maps.Marker({
			title: title,
			position: new google.maps.LatLng(lat, long),
			map: self.map
		});
		marker.addListener('click', function() {
			self.markerSelected(marker);
		});
		marker.addListener('dblclick', function() {
			self.map.fitBounds({west: marker.getPosition().lng() - 1, east: marker.getPosition().lng() + 1, north: marker.getPosition().lat() + 1, south: marker.getPosition().lat() - 1});
		})
		self.markers.push(marker);
	}

	this.createMarkers = function(filteredParks) {
		for (i in filteredParks) {
			var park = filteredParks[i];
			self.createMarker(park.name, park.lat, park.long);
		}
	}

	this.parkSelected = function(park) {
		var marker = self.getMarkerForPark(park);
		self.markerSelected(marker);
	}

	this.markerSelected = function(marker) {
		self.bounceMarker(marker);
		self.infoWindow.open(self.map, marker);
		self.updateInfoWindowContent(marker);
	}

	this.getMarkerForPark = function(park) {
		for (i in self.markers) {
			if (self.markers[i].title == park.name) {
				return self.markers[i];
			}
		}
	}

	this.getParkForMarker = function(marker) {
		var parkList = self.model().parkList();
		for (i in parkList) {
			if (parkList[i].name == marker.title) {
				return parkList[i];
			}
		}
	}

	this.bounceMarker = function(marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 750);
	}

	this.updateInfoWindowContent = function(marker) {
		var park = self.getParkForMarker(marker);
		self.currentParkName = park.name;
		var apiList = self.model().apiList();
		for (api in apiList) {
			apiList[api].requestToken.abort();
			console.log(apiList[api]);
			apiList[api].htmlString(apiList[api].defaultHTML);
			apiList[api].request(park.lat, park.long);
		}
	}

	this.menuClicked = function() {
		$('#filter-menu').toggleClass('hidden');
		$('#nav-area').toggleClass('collapsed');
	}

	// Redraw all markers when the filteredParks list changes.
	self.model().filteredParks.subscribe(function(newValue) {
		if (self.map != undefined) {
			self.removeAllMarkers();
			self.createMarkers(newValue);
			self.adjustBounds();
		}
	})

	self.infoWindowContent.subscribe(function(newValue) {
		self.infoWindow.setContent(newValue);
	});

	self.model().apiList()[0].request(self.model().filteredParks()[0].lat, self.model().filteredParks()[0].long);
}

// Initialize ViewModel
var vm = new ViewModel();

// Apply Knockout bindings
ko.applyBindings(vm);


// var resizeMiddle = function() {
//     var h = $('#nav-area').height() - $('#nav-header').height() - $('#filter-box').height() - $('#api-hr').height() - $('#api-list').height();
//     h = h > 300 ? h : 300;
//     $('#filter-list').height(h);
// }

// $(document).ready(resizeMiddle);
// $(window).resize(resizeMiddle);

	