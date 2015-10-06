function closeSideBar(e) {
    $("#menu-close").click();
}

GoogleMaps.ready('pontos', function(map) {
	map.instance.addListener('click', closeSideBar);
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


