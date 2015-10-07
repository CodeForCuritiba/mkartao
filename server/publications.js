Meteor.publish("pontos", function(){
    return Pontos.find();
});

Meteor.publish("veiculos", function($linha_id) {
    return Veiculos.find();
});