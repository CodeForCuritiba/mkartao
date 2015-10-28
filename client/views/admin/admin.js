Template.admin.helpers({
    getURBSStatus: function() {
        if (Meteor.user) {
            HTTP.get('http://transporteservico.urbs.curitiba.pr.gov.br', {}, function(error, response) {
                if (error) {
                    $('.status').addClass('text-danger').html('Error: ' + error.message);
                } else {
                    $('.status').addClass('text-success').html(response.statusCode);
                }
            });
        };
    }
});

Template.admin.events({
    'click #forceURBSStatus': function () {
        Template.admin.__helpers[" getURBSStatus"]();
    }
});

Template.admin.rendered = function() {
    // Procurar status do webservice da URBS

    setTimeout(Template.admin.__helpers[" getURBSStatus"], 60000);
};
