function closeSideBar(e) {
    $("#menu-close").click();
}

GoogleMaps.ready('map', function(map) {
    map.instance.addListener('click', closeSideBar);
});

// Template:
Template.sidebar.helpers({
    linhas: function () {
        return Linhas.find().map(function(obj){
            return {
                label : obj.nome,
                value : obj.cod,
            };
        });
    }
});

Template.sidebar.rendered = function () {
    // Closes the sidebar menu
    $("#menu-close").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").removeClass("active");
    });

    // Opens the sidebar menu
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").toggleClass("active");
    });

    $('#sidebar-wrapper').on('swiperight', closeSideBar);
}

Template.sidebar.events({
    'change #selectLinha': function (e, template) {
        var val = template.find('#selectLinha').value;
        var url = location.protocol + '//' + location.host + location.pathname;
        document.location.href = url + '?' + val;
    }
});
