// Refactor to separate model file
var Park = function(name, lat, long) {
	'use strict';
	var self = this;
	self.name = name;
	self.lat = lat;
	self.long = long;
};

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
						new Park('Mammoth Cave', 37.18, -86.1),
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
var API = function(name, enabled, iconURL, requestParamType, request) {
	'use strict';
	var self = this;
	self.name = ko.observable(name);
	self.enabled = ko.observable(enabled);
	self.iconURL = iconURL;
	self.request = request;
	self.requestTokens = {};
	self.cache = {};
	self.requestParamType = requestParamType;
	self.defaultHTML = '<div class="api-header"><img class="api-icon" src="' + self.iconURL + '"></img><h2 style="font-weight:lighter;">Making request...</h2></div>';
	self.htmlString = ko.observable(self.defaultHTML);
};

// TODO: rewrite with HTML templates instead of concatenating strings
var apis = [new API('Flickr', true, 'images/flickr.png', 'location', function(lat, lon) {
				'use strict';
				var self = this;
				// Make key for request token dictionary and result data cache
				var key = lat + '$' + lon;
				self.requestTokens[key] = $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6292fdf93c1a3e4947455f9d710fd0d2&format=json&nojsoncallback=1&lat=' + lat + '&lon=' + lon + '&radius=10', function(data){
					// Inject HTML into api div
					var html = '<div id="flickr-photos">';
					if (data.photos.photo.length > 0) {
						var pictureCount = Math.min(data.photos.photo.length, 5);
						// Add 5 images to html string
						// TODO: Randomize photos selected from array
						for (var i = 0; i < pictureCount; i++) {
							var farm = data.photos.photo[i].farm;
							var server = data.photos.photo[i].server;
							var id = data.photos.photo[i].id;
							var secret = data.photos.photo[i].secret;
							html += '<img src="https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '.jpg"></img>';
						}
					} else {
						html += '<h3>No Flickr results</h3>';
					}
					html += '</div>';
					var result = '<div class="api-header"><img class="api-icon" src="' + self.iconURL + '"></img><h2>Flickr photos</h2></div>' + html;
					// Cache result
					self.cache[key] = result;
					self.htmlString(result);
				}).error(function(jqXHR, status, error) {
					self.htmlString('<h3>Error getting photos</h3>');
				});
			}),
			new API('Wikipedia', true, 'images/wikipedia.png', 'name', function(name) {
				'use strict';
				var self = this;
				// Make key for request token dictionary and result data cache
				var key = name;
				self.requestTokens[key] = $.ajax(
					'https://en.wikipedia.org/w/api.php?&action=query&srsearch=' + name + '&list=search&format=json', {
					dataType: 'jsonp',
					success: function(data, status, request) {
						// Inject HTML into api div
						var html = '<div id="wiki-articles">';
						var search = data.query.search;
						var min = Math.min(data.query.search.length, 5);
						// Add articles to html string
						for (var i = 0; i < min; i++) {
							var title = search[i].title;
							html += '<a display="block"href="https://en.wikipedia.org/w/index.php?title="' + title + '>' + title + '</a>';
						}
						html += '</div>';
						var result = '<div class="api-header"><img class="api-icon" src="' + self.iconURL + '"></img><h2>Wikipedia articles</h2></div>' + html;
						// Cache result
						self.cache[name] = result;
						self.htmlString(result);
					},
					error: function(jqXHR, status, request) {
						self.htmlString('<h3>Error getting Wikipedia articles');
					},
					timeout: 5000

				}).error(function() { 
					self.htmlString('<h3>Error getting Wikipedia articles</h3>');
				});
			}),
			new API('Foursquare', true, 'images/foursquare.png', 'location', function(lat, lon) {
				'use strict';
				var self = this;
				// Make key for request token dictionary and result data cache
				var key = lat + '$' + lon;
				self.requestTokens[key] = $.getJSON('https://api.foursquare.com/v2/venues/search?intent=browse&client_id=5DQOVDCBMLP5BWR0KLMMMR3FSNMYGQ3YLO5RLT1M3SSKGVCS&client_secret=2S33ZUR25W0JXC3YY0VAVPX0XCPDH032QDTZGFIDNCWAOXF1&v=20130815&category=52e81612bcbc57f1066b7a21,4bf58dd8d48988d1e2941735,52e81612bcbc57f1066b7a22,4bf58dd8d48988d1df941735,4bf58dd8d48988d1e4941735,50aaa49e4b90af0d42d5de11,52e81612bcbc57f1066b7a12,52e81612bcbc57f1066b7a0f,52e81612bcbc57f1066b7a23,4bf58dd8d48988d15a941735,4bf58dd8d48988d1e0941735,4bf58dd8d48988d160941735,50aaa4314b90af0d42d5de10,4bf58dd8d48988d161941735,4bf58dd8d48988d15d941735,4eb1d4d54b900d56c88a45fc,52e81612bcbc57f1066b7a21,52e81612bcbc57f1066b7a13,4bf58dd8d48988d162941735,52e81612bcbc57f1066b7a14,4bf58dd8d48988d163941735,4eb1d4dd4b900d56c88a45fd,50328a4b91d4c4b30a586d6b,4bf58dd8d48988d165941735,4bf58dd8d48988d1e9941735,4bf58dd8d48988d159941735,52e81612bcbc57f1066b7a24,5032848691d4c4b30a586d61&radius=8000&ll=' + lat + ',' + lon, function(data) {
					// Inject HTML into API div
					var html = '<div id="foursquare-venues">';
					var venues = data.response.venues;
					if (venues.length > 0) {
						var venueCount = Math.min(venues.length, 5);
						// Add venues to html string
						for (var i = 0; i < venueCount; i++) {
							var name = venues[i].name;
							var url = venues[i].url;
							if (venues[i].url) {
								html += '<a display="block" href="' + url + '">' + name + '</a>';
							} else {
								html += '<a display="block">' + name + '</a>';
							}
						}
					} else {
						html += '<h3>No Foursquare results</h3>';
					}
					html += '</div>';
					var result = '<div class="api-header"><img class="api-icon" src="' + self.iconURL + '"></img><h2>Foursquare check-in spots</h2></div>' + html;
					// Cache result
					self.cache[key] = result;
					self.htmlString(result);
				}).error(function(jqXHR, status, error) {
					self.htmlString('<h3>Error getting Foursquare park info</h3>');
				});
			})];

var Model = function() {
	'use strict';
	var self = this;
	self.currentSearch = ko.observable("US National Parks");
	self.filterString = ko.observable("");
	self.parkList = ko.observableArray(nationalParkList);
	self.filteredParks = ko.computed(function() {
		return self.parkList().filter(function(element) {
			return (element.name.toLowerCase().indexOf(self.filterString().toLowerCase()) > -1);
		}, self);		
	}, self);

	// Find bounds for map based on latitude and longitude of parks
	self.bounds = ko.computed(function() {
		var list;
		if (self.filteredParks().length === 0) {
			list = self.parkList();
		} else {
			list = self.filteredParks();
		}
		var lats = [];
		var longs = [];
		list.forEach(function(elem) {
			lats.push(elem.lat);
			longs.push(elem.long);
		});

		// Extend latitude and longitude by one degree in each direction to give a margin on the map
		var bounds = {sw: { lat: Math.min.apply(null, lats) - 1, lng: Math.min.apply(null, longs) - 1 }, ne: { lat: Math.max.apply(null, lats) + 1, lng: Math.max.apply(null, longs) + 1 }};
		return bounds;
	});
	self.selectedResultIndex = ko.observable(null);
	self.apiList = ko.observableArray(apis);

};

var ViewModel = function() {
	'use strict';
	var self = this;	
	self.model = ko.observable(new Model());
	self.currentPark = ko.observable(null);	
	self.markers = [];
	self.minZoom = 1;
	self.menuCollapsed = ko.observable(false);
	// Most linters will claim that these variables are never used, but that's not true.
	// Linters probably claim this because my code never directly assigns a value to them.
	// However these variable are used in arguments for the Google Maps API.
	// The Google Maps API assigns an object to each of these variables.
	var map, infoWindow;

	// Find all content that needs to go in the infoWindow
	self.infoWindowContent = ko.pureComputed(function() {
		var htmlString = '<div id="info-window-content"><h1 class="park-info-window-title">' + self.currentPark() + '<small>National Park</small></h1>';
		var apiList = self.model().apiList();
		apiList.forEach(function(api) {
			if (api.enabled() === true) {
				htmlString += '<div class="api-item info-window-container">';
				htmlString += api.htmlString();
				htmlString += '</div>';
			}
		});
		htmlString += '</div>';
		return htmlString;
	});

	// Generate html strings in all the api objects for the given marker.
	// When these html strings update, the infoWindowContent variable will update
	// with all the appropriate data.
	self.updateInfoWindowContent = function(marker) {
		var park = this.getParkForMarker(marker);
		self.currentPark(park.name);
		var apiList = self.model().apiList();
		apiList.forEach(function(api) {
			var key, defHTML;
			if (api.requestParamType == 'location') {
				key = park.lat + '$' + park.long;
				if (api.cache[key]) {
					api.htmlString(api.cache[key]);
				} else if (!api.requestTokens[key]) {
					defHTML = api.defaultHTML;
					api.htmlString(defHTML);
					api.request(park.lat, park.long);
				}
			} else if (api.requestParamType == 'name') {
				key = park.name;				
				if (api.cache[key]) {
					api.htmlString(api.cache[key]);
			 	} else if (!api.requestTokens[key]) {
			 		defHTML = api.defaultHTML;
					api.htmlString(defHTML);
					api.request(park.name);
				}
			}				
		});
	};

	// When the infoWindowContent variable changes, automatically
	// place this into the infoWindow's content variable.
	self.infoWindowContent.subscribe(function(newValue) {
		self.infoWindow.setContent(newValue);
	});

	// Callback function after requesting Google map .js file
	self.initMap = function() {
		self.map = new google.maps.Map(document.getElementById('map'), {
			mapTypeControlOptions: {position: google.maps.ControlPosition.TOP_RIGHT}
		});


		// Reset bounds if zoomed out too far
		google.maps.event.addListener(self.map, 'zoom_changed', function() {
		    var listener = 
		        google.maps.event.addListener(self.map, 'bounds_changed', function(event) {
		            if (this.getZoom() < self.minZoom) {
		                self.adjustBounds();
		            }
		        google.maps.event.removeListener(listener);
		    });
		});

		google.maps.event.addListener(self.map, 'click', function() {
			if (self.currentPark() && self.infoWindow) {
				self.infoWindow.close();
				self.currentPark(null);
			}
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

	};

	// Find appropriate bounds to fit data and change map bounds
	self.adjustBounds = function() {
		var bounds = self.model().bounds();
		var apiBounds = new google.maps.LatLngBounds(bounds.sw, bounds.ne);
		self.map.fitBounds(apiBounds);
	};

	// Remove all markers from the map
	self.removeAllMarkers = function() {
		self.markers.forEach(function(marker) {
			marker.setMap(null);				
		})
		self.markers = [];
	};

	// Create a marker for the map
	self.createMarker = function(title, lat, long) {
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
		});
		self.markers.push(marker);
	};

	// Find filtered parks and create all markers for them
	self.createMarkers = function(filteredParks) {
		filteredParks.forEach(function(park) {
			self.createMarker(park.name, park.lat, park.long);				
		});
	};

	// React to when a park is selected in the nav menu list
	self.parkSelected = function(park) {
		var marker = self.getMarkerForPark(park);
		if (window.screen.width < 600) {
			self.menuClicked();
		}
		self.markerSelected(marker);
	};

	// React to when a marker is selected on the map
	self.markerSelected = function(marker) {
		self.bounceMarker(marker);
		self.updateInfoWindowContent(marker);
		self.infoWindow.open(self.map, marker);
	};

	// Get the correct equivalent marker for a given park
	self.getMarkerForPark = function(park) {
		for (var i = 0; i < self.markers.length; i++) {
			if (self.markers[i].title == park.name) {
				return self.markers[i];
			}
		}
	};

	// Get the correct equivalent park for a given marker
	self.getParkForMarker = function(marker) {
		var parkList = self.model().parkList();
		for (var i = 0; i < parkList.length; i++) {
			if (parkList[i].name == marker.title) {
				return parkList[i];
			}
		}
	};

	// Animate the map marker to bounce
	self.bounceMarker = function(marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 750);
	};

	// Animate the nav menu hiding and showing
	self.menuClicked = function() {
		self.menuCollapsed(!self.menuCollapsed());
	};

	// Animate the hiding and showing of the filter menu
	self.menuCollapsed.subscribe(function(newValue) {
		if (newValue === true) {
			$('#filter-menu').slideUp(400, function() {
				$('#nav-area').toggleClass('collapsed');
			});
		} else {
			// Animation tends to 'stick' or stop sometimes,
			// usually the first time it is use.
			// Only happens on Chrome and Chrome Canary among OS X browsers.
			$('#nav-area').toggleClass('collapsed');
			$('#filter-menu').slideDown(500);
		}

	});

	// Redraw all markers when the filteredParks list changes.
	self.model().filteredParks.subscribe(function(newValue) {
		if (self.map !== undefined) {
			self.removeAllMarkers();
			self.createMarkers(newValue);
			self.adjustBounds();
		}
	});

	// Collapse the menu by default for small screens
	if (document.documentElement.clientWidth < 600) {
		document.getElementById('filter-menu').style.display = 'none';
		self.menuCollapsed(true);
	}

	$('#flickr-photos img').onload = function() {
		self.infoWindow.open(self.map);
	}
};

// Initialize ViewModel
var vm = new ViewModel();

// Apply Knockout bindings
ko.applyBindings(vm);

// Icon credits:
// Flickr icon: http://lopagof.deviantart.com/art/Flickr-icons-scalable-85495940
// Wikipedia icon: http://www.iconarchive.com/show/popular-sites-icons-by-sykonist/Wikipedia-icon.html
// Foursquare icon: https://foursquare.com/about/logos
	