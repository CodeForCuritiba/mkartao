Veiculos = new Mongo.Collection("veiculos");
Veiculos.allow({
    insert: function(){
        return false;
    },
    update: function(){
        return false;
    },
    remove: function(){
        return false;
    }
});
