Linhas = new Mongo.Collection("linhas");
Linhas.allow({
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
