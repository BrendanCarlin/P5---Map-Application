//declare global variables for scope access
var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 27.6938, lng: -82.679576},
		scrollwheel: false,
		zoom: 11
	});

	$('#menu').on('click', function() {
		$('body').toggleClass('menu-hidden');
	});	

	ko.applyBindings(new ViewModel);
}

function noMap() {
	alert("We're having difficulty communicating with Google Maps.  We apologize for any inconvenience.");
}

//create place constructor
var Place = function(place) {
	this.lat = place.lat;
	this.lng = place.lng;
	this.title = place.title;
	this.icon = place.icon; 
};

var ViewModel = function() {
	var self = this;

	//create empty array to hold location data from model
	self.placeIndex = [];

	//pull data from model into ViewModel using Place constructor,
	//storing each object in the placeIndex array
	places.forEach( function(place) {
		self.placeIndex.push(new Place(place));
	});

	//create a places list observable array
	self.placesList = ko.observableArray();

	//push placeIndex data into observable array
	self.placeIndex.forEach( function(place) {
		self.placesList.push(place);	
	});

	//create empty string as an observable to
	//bind to the view's search field
	self.searchValue = ko.observable("");

	//create a search filter function
	self.searchFilter = function() {
		//clear list view when user types in search field
		self.placesList.removeAll();

		//iterate through placesIndex and compare each keyup event
		//with the indexOf each place.title instance
		self.placeIndex.forEach( function(place) {
			//hide markers from view
			place.marker.setVisible(false);
			//compare keyup event with place.title instances
			if ( place.title.toLowerCase().indexOf(self.searchValue().toLowerCase()) >= 0 ) {
				self.placesList.push(place);
			};
		});

		self.placesList().forEach( function(place) {
			place.marker.setVisible(true);
		});
	};

	//use the marker click event on our HTML list items
	self.list = function (place, marker) {
		google.maps.event.trigger(place.marker, 'click');
	};

	self.titleHeader = ko.observable('');
	self.imgSource = ko.observable('');
	self.details = ko.observable();

	//place markers on map by iterating through placeIndex
	self.placeIndex.forEach( function(place) {
		place.marker = new google.maps.Marker({
			position: {lat: place.lat, lng: place.lng},
			title: place.title,
			icon: place.icon,
			animation: google.maps.Animation.DROP,
			map: map,
		});

		//add a click event-listener to each marker instance
		place.marker.addListener('click', function() {
			markerClick();
		});


		//declare how the marker should respond on click
		function markerClick() {
			//check if menu is visible, then hide it
			if ( $('body').hasClass('') ) {
				setTimeout(function() {
					$('body').toggleClass('menu-hidden');	
				}, 250);
			};
			
			//create bounce effect on click
			if(place.marker.getAnimation() !== null) {
				place.marker.setAnimation(null);
			} else {
				place.marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function() {
					place.marker.setAnimation(null);
				}, 1400);
			};

			//run functions for that marker to create modal data
			handleHeader(place);
			handleImage(place);
			handleText(place);

			//display modal -- used delay to show bounce on markers prior
			//to loading modal data
			setTimeout(function() {
				$('#myModal').modal('show');
			}, 1500);
		}

		//function to collect the modal header based on the marker clicked
		handleHeader = function(place) {
			var title = place.marker.title;
			self.titleHeader(title);
		};

		//function to collect the modal's image content based on marker clicked
		handleImage = function(place) {
			//use marker position properties to capture latitude and longitude
			var lat = place.marker.position.lat().toString();
			var lng = place.marker.position.lng().toString();
			//create string for latitude and longitude of clicked marker
			var location = lat + ", " + lng;
			//add string to googlestreetview URL
			var imgSrc = "https://maps.googleapis.com/maps/api/streetview?location=" + location + "&size=600x300" + "&key=AIzaSyCcv1EjRfx93K6_x1QuIocTsz-2r1Qu8DQ";
			//set the modal picture using the googlestreetview URL
			self.imgSource(imgSrc);
		};

		//function to collect the modal's text conted based on marker clicked
		handleText = function(place) {
			//send JSON request to wikipedia using the marker title as the search term
			$.getJSON("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=" + place.marker.title + "&origin=*", function(data) {
				//capture the object id for the object returned by json request
				var id = Object.keys(data.query.pages);
				//handle no result found...
				if (id < 0) {
					self.details("<em>Whoops... the content you've requested could not be retrieved.</em>");
				} else {
					//convert object id to number
					var pageid = Number(id);
					//use object id to index content and place in modal
					self.details(data.query.pages[pageid].extract);
				}
			})
			.fail(function() {
				alert("We're having difficulty accessing Wikipedia for a description of this location. Please try again later.");
			});
		};
	});
};

//The Model
var places = [
	{
		lat: 27.7659901,
		lng: -82.6314354,
		title: "Salvador Dalí Museum",
		icon: 'img/art.png'
	},
	{
		lat: 27.7719046,
		lng: -82.6359159,
		title: "Jannus Live",
		icon: 'img/music.png'
	},
	{
		lat: 27.7711675,
		lng: -82.6432399,
		title: "State Theatre (St. Petersburg, Florida)",
		icon: 'img/theater.png'
	},
	{
		lat: 27.7679982,
		lng: -82.6548183,
		title: "Tropicana Field",
		icon: 'img/baseball.png'
	},
	{
		lat: 27.6351649,
		lng: -82.7193227,
		title: "Fort De Soto Park",
		icon: 'img/tents.png'
	},
	{
		lat: 27.6761268,
		lng: -82.7372995,
		title: "Shell Key Preserve",
		icon: 'img/kayaking.png'
	},
	{
		lat: 27.6548677,
		lng: -82.7178069,
		title: "Tampa Bay Watch",
		icon: 'img/fish.png'
	}
];