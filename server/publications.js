Meteor.publish("pois", function(){
    return Pois.find();
});

Meteor.publish("veiculos", function($linha_id) {
    return Veiculos.find();
});

Meteor.publish("linhas", function($linha_id) {
    return Linhas.find();
});
