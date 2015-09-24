// Alguns pontos da urbs estão com ',' e em String, essa função converte eles para float
var stringToFloat = function(str){
    if (typeof str == "String")
        return parseFloat( str.replace(/,/ig, '.') );

    return str;
}

Template.pontos.helpers({
    // Envia pontos para o layout "main"
    pontos: function() {
        return Pontos.find().fetch()
    },
    mapOptions: function() {
        if (GoogleMaps.loaded()) {
            return {
                // Centro de Curitiba
                center: new google.maps.LatLng(-25.4451518, -49.2874026),
                zoom: 12
            };
        }
    }
});

// Quando o template for criado
Template.pontos.onCreated(function() {
    Meteor.subscribe("pontos");

    // quando o mapa estiver criado
    GoogleMaps.ready('pontos', function(map) {
        var pontos = Pontos.find().fetch();
        var markers = {};

        // Observa mudanças nos pontos (reativamente)
        Pontos.find().observe({
            // Quando um ponto é adicionado
            added : function(doc){
                var lat = stringToFloat(doc.lat);
                var lon = stringToFloat(doc.lon);

                var marker = new google.maps.Marker({
                    animation : google.maps.Animation.DROP,
                    position : new google.maps.LatLng(lat, lon),
                    title : doc.nome,
                    map : map.instance,
                    id : doc._id
                });

                // @TODO Pode-se fazer o que quiser com o marker nesse ponto

                markers[doc._id] = marker;
            },
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
