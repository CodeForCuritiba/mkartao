Meteor.publish("pontos", function(){
    return Pontos.find();
});

Meteor.publish("veiculos", function($linha_id) {
    return Veiculos.find();
});

Meteor.publish("linhas", function($linha_id) {
    return Linhas.find();
});
