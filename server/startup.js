Meteor.startup(function () {
    // code to run on server at startup
    
	if (process.env.URBS_KEY) {
		HTTP.get("http://transporteservico.urbs.curitiba.pr.gov.br/getPois.php?c=" + process.env.URBS_KEY,
		  {},
		  function (error, result) {
		    if (!error) {
		    	if (result.content) {
		    		Pontos.remove({});
		    	
			    	pois = JSON.parse(result.content);
			    	var vendas = ["BANCA DE REVISTA - CARTÃO TRANSPORTE","TERMINAL DE TRANSPORTE - CARTÃO TRANSPORTE","ESTAÇÃO TUBO - CARTÃO TRANSPORTE"];
			    	var postos = ["RUA DA CIDADANIA - CARTÃO TRANSPORTE","POSTOS DE ATENDIMENTO URBS - CARTÃO TRANSPORTE"];
			    	
			    	pois.forEach(function(poi) {
			    		
			    		var type = false;
			    		if (vendas.indexOf(poi.POI_CATEGORY_NAME) > -1) type = 'venda';
			    		if (postos.indexOf(poi.POI_CATEGORY_NAME) > -1) type = 'posto';
			    		
			    		if (type) {
			    			str = poi.POI_NAME.split(' - ');
			    			if (str.length == 1) str = poi.POI_NAME.split('- ');
			    			
			    			name = str.shift().trim();
			    			if (type == 'posto') str.push(poi.POI_DESC.trim());
			    			desc =  str.join('<br />');
			    			
			    			doc = {
						    		name: name,
						    		type: type, 
						    		lon: poi.POI_LON.replace(',','.'), 
						    		lat: poi.POI_LAT.replace(',','.'), 
						    		address: desc 
						    };
						    Pontos.insert(doc);
						    console.log('Inserting Ponto: '+doc.name);
			    		}
		
			    	});
			    } else {
			    	console.log("Error: no content found in URBS webservice");
			    }
		    	
		    } else {
		    	console.log("Error: URBS webservice unavailable");
		    }
		  }
		);
	} else {
		console.log('Error: URBS_KEY not defined');
	}
		

});

/*
    'Rodoferroviária'                   => array('Av. Presidente Affonso Camargo, 330', -25.437040, -49.256569, $postos_default_horarios),
    'Rua da Cidadania Boa Vista'        => array('Av. Paraná, 3600 - Próx. Posto de Saúde 24h - Boa Vista', -25.385353, -49.232734, $postos_default_horarios),
    'Rua da Cidadania Boqueirão'        => array('Terminal do Carmo', -25.500989, -49.236959, $postos_default_horarios),
*/