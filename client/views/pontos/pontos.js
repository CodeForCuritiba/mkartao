// Alguns pontos da urbs estão com ',' e em String, essa função converte eles para float
var stringToFloat = function(str){
    if (typeof str == "String")
        return parseFloat( str.replace(/,/ig, '.') );

    return str;
}

var latLng;
var ZOOM = 14;

Template.pontos.helpers({
    // Envia pontos para o layout "main"
    pontos: function() {
        return Pontos.find().fetch()
    },
	geolocationError: function() {
	    var error = Geolocation.error();
		latLng = { 'lat': -25.431138, 'lng': -49.271788 };
		ZOOM = 11;
	    return error && error.message;
	},
    mapOptions: function() {
		latLng = Geolocation.latLng();
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
		        zoom: ZOOM,
		        mapTypeId: google.maps.MapTypeId.ROADMAP,
		        panControl: false,
		        scaleControl: false,
		        scrollwheel: false,
		        mapTypeControlOptions: {
		            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
		            position: google.maps.ControlPosition.BOTTOM_RIGHT
		        },
		        styles: [
				    {
				        featureType: "poi",
				        elementType: "labels",
				        stylers: [
				        { visibility: "off" }
				        ]
				    },
				    {
				        featureType: "landscape.man_made",
				        elementType: "labels",
				        stylers: [
				        { visibility: "off" }
				        ]
				    }
				],
            };
        }
    }
});


// Quando o template for criado
Template.pontos.onCreated(function() {
    Meteor.subscribe("pontos");

    // quando o mapa estiver criado
    GoogleMaps.ready('pontos', function(map) {
		var icons = {
			'venda': new google.maps.MarkerImage('img/venda.png', null, null, null, new google.maps.Size(28*.8,55*.8)),
			'posto': new google.maps.MarkerImage('img/posto.png', null, null, null, new google.maps.Size(34*.7,49*.7))
		};
        var pontos = Pontos.find().fetch();
        var markers = {};

	    var latLng = Geolocation.latLng();
	    var marker = new google.maps.Marker({
	      position: new google.maps.LatLng(latLng.lat, latLng.lng),
          title : "Você esta aqui",
	      map: map.instance,
          icon: 'img/you.png',
	    });
    
        var addPontos = function(doc){
            var lat = stringToFloat(doc.lat);
            var lon = stringToFloat(doc.lon);

            var marker = new google.maps.Marker({
                animation : google.maps.Animation.DROP,
                position : new google.maps.LatLng(lat, lon),
                title : doc.name,
                map : map.instance,
                id : doc._id,
                icon: icons['venda'],
            });

            markers[doc._id] = marker;

		   /* content = '<div id="content"><h3>' + doc.name + '</h3><p>' + doc.address;
		
		    link = 'http://maps.google.com/maps?dirflg=w&daddr=' + lat + ',' + lng;
		    link = '<br><a class="link-map" target="map" href="' + link + '">Como ir?</a>';
		
		    if (doc.openhours) content = content + '<br/>Aberto ' + doc.openhours;
		    content = content + link + '</p>' + '</div>';*/
		   content = doc.name;
		
		    var infowindow = new google.maps.InfoWindow({
		        content:  content
		    });
		
		    google.maps.event.addListener(infowindow, 'domready', function() {
		        $('.link-map').each(function() {
		            this.href = this.href + '&saddr=' + myLatlng.lat() + ',' + myLatlng.lng();
		        });
		    });
		
			var windowopen;
		    google.maps.event.addListener(markers[doc._id], 'click', function() {
		        if (windowopen) windowopen.close();
		        infowindow.open(map,marker);
		        windowopen = infowindow;
		    });
        }

        //pontos.forEach(addPontos);

        // Observa mudanças nos pontos (reativamente)
        Pontos.find().observe({
            // Quando um ponto é adicionado
            added : addPontos,
            // Quando for alterado
            changed : function(newDoc, oldDoc){
                markers[newDoc._id].setPosition({ lat : stringToFloat(newDoc.lat), lng : stringToFloat(newDoc.lon) });
            },
            // Quando um ponto é removido
            removed : function(oldDoc){
                markers[oldDoc._id].setMap(null);
                google.maps.event.clearInstanceListeners(markers[oldDoc._id]);
                delete markers[oldDoc._id];
            }
        });

    });
});
