// Refactor to separate model file
var Park = function(name, lat, long) {
	this.name = name;
	this.lat = lat;
	this.long = long;

}

var nationalParkList = [new Park('Acadia', 44.35, -68.21),
						new Park('American Samoa', -14.25, -170.68),
						new Park('Arches', 38.68, -109.57),
						new Park('Badlands', 43.75, -102.50),
						new Park('Big Bend', 29.25, -103.25),
						new Park('Biscayne', 25.65, -80.08)];


var API = function(name, enabled, defaultTemplate, request) {
	this.name = ko.observable(name);
	this.enabled = ko.observable(enabled);
	this.request = request;
	this.htmlString = ko.observable(defaultTemplate);
}

var apis = [];

var Model = function() {
	var self = this;
	this.currentSearch = ko.observable("National Parks");
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
	var map, infoWindow;

	this.infoWindowContent = '<div><h3>Hello, World</h3></div>';

	this.initMap = function() {
		self.map = new google.maps.Map(document.getElementById('map'));

		self.adjustBounds();
		self.createMarkers(self.model().filteredParks());
		self.infoWindow = new google.maps.InfoWindow({content: self.infoWindowContent});
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
			self.bounceMarker(marker);
			self.infoWindow.open(self.map, marker);
		});
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
		self.bounceMarker(marker);
	}

	this.getMarkerForPark = function(park) {
		for (i in self.markers) {
			if (self.markers[i].title == park.name) {
				return self.markers[i];
			}
		}
	}

	this.getParkForMarker = function(marker) {
		for (i in self.markers) {
			if (self.markers[i].title == park.name) {
				self.bounceMarker(self.markers[i]);
				break;
			}
		}
	}

	this.bounceMarker = function(marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 750);
	}

	// Redraw all markers when the filteredParks list changes.
	self.model().filteredParks.subscribe(function(newValue) {
		if (self.map != undefined) {
			self.removeAllMarkers();
			self.createMarkers(newValue);
			self.adjustBounds();
		}
	})
}

// Initialize ViewModel
var vm = new ViewModel();

// Apply Knockout bindings
ko.applyBindings(vm);

	