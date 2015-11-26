// Alguns pontos da urbs estão com ',' e em String, essa função converte eles para float
var stringToFloat = function(str){
    return parseFloat( str.replace(',', '.') );
};

var syncVeiculos = function() {
    if (linha = location.search.substr(1)) {
        Meteor.call('traceVeiculos', linha);
        timr = setTimeout(syncVeiculos,10000);
    }
};

function chosenUpdate(){
    $('#selectLinha').trigger("chosen:updated");
};

var latLng;
var timr;
var ZOOM = 14;
Session.setDefault("modal", {});

Template.pontos.helpers({
    geolocationError: function() {
        var error = Geolocation.error();
        latLng = { 'lat': -25.431138, 'lng': -49.271788 };
        ZOOM = 11;
        return error && error.message;
    },
    modal : function(){
        return Session.get('modal');
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

Template.pontos.onRendered(function(){
    $('#selectLinha').chosen({ width: '100%' });
});

// Quando o template for criado
Template.pontos.onCreated(function() {
    Meteor.subscribe("pois");
    Meteor.subscribe("veiculos");
    Meteor.subscribe("linhas");

    // Atualiza chosen da linhas
    Linhas.find().observe({
        added : function(){
            chosenUpdate();
        },
        changed : function(){
            chosenUpdate();
        },
        added : function(){
            chosenUpdate();
        },
    });

    // quando o mapa estiver criado
    GoogleMaps.ready('map', function(map) {
        var icons = {
            'venda': new google.maps.MarkerImage('img/venda.png', null, null, null, new google.maps.Size(28*.8,55*.8)),
            'posto': new google.maps.MarkerImage('img/posto.png', null, null, null, new google.maps.Size(34*.7,49*.7)),
            'you'  : new google.maps.MarkerImage('img/you.png', null, null, null, new google.maps.Size(33*.8,33*.8)),
            'veiculo' : new google.maps.MarkerImage('img/veiculo.png', null, null, null, new google.maps.Size(50*.5,69*.5))
        };
        var pois = Pois.find().fetch();
        var markers = {};

        var latLng = Geolocation.latLng();
		var bounds;

    	var geocoder = new google.maps.Geocoder();
		loc = new google.maps.LatLng(latLng.lat, latLng.lng);

		geocoder.geocode({ 'latLng': loc  }, function(results, status) {
	    	var found = 0;
		    if (status == google.maps.GeocoderStatus.OK) {
		    	results[1].address_components.forEach(function(component) {
		    		if (component.long_name == "Curitiba") found = 1;
		    	});
		    }

	    	if (!found) {
	    		if(bounds) {
	    			map.instance.fitBounds(bounds);
	    		} else {
		    		map.instance.setCenter(new google.maps.LatLng( -25.431138, -49.271788 ));
		    		map.instance.setZoom(12);
	    		}
	    	}

		});

        var marker = new google.maps.Marker({
          position: loc,
          title : "Você esta aqui",
          map: map.instance,
          icon: icons['you'],
        });

        var windowopen;

        var addPois = function(doc){i
            var lat = stringToFloat(doc.lat);
            var lng = stringToFloat(doc.lon);

            var marker = new google.maps.Marker({
                animation : google.maps.Animation.DROP,
                position : new google.maps.LatLng(lat, lng),
                title : doc.name,
                map : map.instance,
                id : doc._id,
                icon: icons[doc.type],
            });

           content = '<div id="content"><h3>' + doc.name + '</h3><p>' + doc.address;

            link = 'http://maps.google.com/maps?dirflg=w&daddr=' + lat + ',' + lng;
            link = '</p><p><a class="link-map" target="map" href="' + link + '">Como ir?</a></p>';

            if (doc.openhours) content = content + '<br/>Aberto ' + doc.openhours;
            content = content + link + '</p>' + '</div>';


            var infowindow = new google.maps.InfoWindow({
                content:  content
            });

            google.maps.event.addListener(infowindow, 'domready', function() {
                $('.link-map').each(function() {
                    this.href = this.href + '&saddr=' + latLng.lat + ',' + latLng.lng;
                });
            });

            google.maps.event.addListener(marker, 'click', function() {
                if (windowopen) windowopen.close();
                infowindow.open(map.instance,marker);
                windowopen = infowindow;
            });

            markers[doc._id] = marker;
        };

        var addVeiculos = function(doc){
            var lat = stringToFloat(doc.lat);
            var lng = stringToFloat(doc.lon);

            var marker = new google.maps.Marker({
                animation : google.maps.Animation.DROP,
                position : new google.maps.LatLng(lat, lng),
                title : doc.prefixo,
                map : map.instance,
                id : doc._id,
                icon: icons['veiculo'],
            });

            markers[doc._id] = marker;

            attachInfowindow(markers[doc._id],doc);
        };

        var drawTrajeto = function(trajeto) {
            var arr = [];
            bounds = new google.maps.LatLngBounds();
            trajeto.forEach(function(p) {
	            lat = stringToFloat(p.LAT);
	            lng = stringToFloat(p.LON);
            	arr.push({lat: lat, lng: lng});
            	bounds.extend(new google.maps.LatLng(lat,lng));
            });

            var path = new google.maps.Polyline({
			    path: arr,
			    geodesic: true,
			    strokeColor: '#FF0000',
			    strokeOpacity: 1.0,
			    strokeWeight: 2
			  });

			path.setMap(map.instance);
  			map.instance.fitBounds(bounds);
        };

        var attachInfowindow = function (marker,doc) {
        	console.log(doc);
            d = new Date();
            arr = d.toLocaleTimeString().split(':');
            now = parseInt(arr[0])*3600+parseInt(arr[1])*60+parseInt(arr[2]);

            arr = doc.updated_at.split(':');
            then = parseInt(arr[0])*3600+parseInt(arr[1])*60+parseInt(arr[2]);

            diff = now - then;
            if (diff < 0) diff = diff + 24*3600;

            content = 'Posição as '+doc.updated_at; //'Há '+ Math.floor(diff / 60) +"'"+ (diff % 60);

            var infowindow = new google.maps.InfoWindow({
                content:  content
            });

            google.maps.event.addListener(marker, 'click', function() {
                if (windowopen) windowopen.close();
                infowindow.open(map.instance,marker);
                windowopen = infowindow;
            });
        };

        // Observa mudanças nos pontos (reativamente)
        Pois.find().observe({
            // Quando um ponto é adicionado
            added : addPois,
            // Quando for alterado
            changed : function(newDoc, oldDoc){
                markers[newDoc._id].setPosition(new google.maps.LatLng(stringToFloat(newDoc.lat),stringToFloat(newDoc.lon)));
            },
            // Quando um ponto é removido
            removed : function(oldDoc){
                markers[oldDoc._id].setMap(null);
                google.maps.event.clearInstanceListeners(markers[oldDoc._id]);
                delete markers[oldDoc._id];
            }
        });

        // Observa mudanças nos veiculos (reativamente)
        if (cod = location.search.substr(1)) {
            Veiculos.find({ linha : cod }).observe({
                // Quando um ponto é adicionado
                added : addVeiculos,
                // Quando for alterado
                changed : function(newDoc, oldDoc){
                	markers[newDoc._id].setPosition(new google.maps.LatLng(stringToFloat(newDoc.lat),stringToFloat(newDoc.lon)));
                	attachInfowindow(markers[newDoc._id],newDoc);
                },
                // Quando um ponto é removido
                removed : function(oldDoc){
                    markers[oldDoc._id].setMap(null);
                    google.maps.event.clearInstanceListeners(markers[oldDoc._id]);
                    delete markers[oldDoc._id];
                }
            });

			l = Linhas.findOne({ cod : cod });
			if (l.trajeto) {
				drawTrajeto(l.trajeto);
			}

            Linhas.find({ cod : cod }).observe({
                // Quando for alterado
                changed : function(newDoc, oldDoc){
					if (newDoc.trajeto) {
						drawTrajeto(newDoc.trajeto);
					}
                },
            });

	        syncVeiculos();
        }

        map.instance.addListener('click', function() {
            if (windowopen) windowopen.close();
        });

        timr =  setTimeout(syncVeiculos,500);

    });
});
