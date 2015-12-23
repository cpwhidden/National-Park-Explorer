// Refactor to separate model file
var nationalParkList = [{
	name : 'Acadia',
	lat : 44.35,
	long : -68.21
	},
	{
		name : 'American Samoa',
		lat : -14.25,
		long : -170.68
	},
	{
		name : 'Arches',
		lat : 38.68,
		long : -109.57
	},
	{
		name : 'Badlands',
		lat : 43.75,
		long : -102.50
	},
	{
		name : 'Big Bend',
		lat : 29.25,
		long : -103.25
	},
	{
		name : 'Biscayne',
		lat : 25.65,
		long : -80.08
	}];

var Park = function(name, lat, long) {
	this.name = name;
	this.lat = lat;
	this.long = long;

}

var apis = [];

var API = function(name, enabled, defaultTemplate, request) {
	this.name = ko.observable(name);
	this.enabled = ko.observable(enabled);
	this.request = request;
	this.htmlString = ko.observable(defaultTemplate);
}

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
	var map;

	this.initMap = function() {
		self.map = new google.maps.Map(document.getElementById('map'));

		self.adjustBounds();
		self.createMarkers(self.model().filteredParks());

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
		self.markers.push(new google.maps.Marker({
			title: title,
			position: new google.maps.LatLng(lat, long),
			map: self.map
		}))
	}

	this.createMarkers = function(filteredParks) {
		for (i in filteredParks) {
			var park = filteredParks[i];
			self.createMarker(park.name, park.lat, park.long);
		}
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

	