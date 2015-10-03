Meteor.startup(function () {
    // code to run on server at startup

	if (!Pontos.findOne()) {
        Pontos.insert(
        	{
        		name: "Rodoferroviária", 
        		lon: -49.256569, 
        		lat: -25.437040, 
        		address: "Av. Presidente Affonso Camargo, 330", 
        		openhours: "dias úteis das 8h30 às 17h"
        	}
        );
	}

});

/*
    'Rodoferroviária'                   => array('Av. Presidente Affonso Camargo, 330', -25.437040, -49.256569, $postos_default_horarios),
    'Rua da Cidadania Boa Vista'        => array('Av. Paraná, 3600 - Próx. Posto de Saúde 24h - Boa Vista', -25.385353, -49.232734, $postos_default_horarios),
    'Rua da Cidadania Boqueirão'        => array('Terminal do Carmo', -25.500989, -49.236959, $postos_default_horarios),
*/