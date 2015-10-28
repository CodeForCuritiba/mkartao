// Listen to incoming HTTP requests, can only be used on the server

Meteor.methods({
    resetear: function() {
        Veiculos.remove({});

        if (process.env.URBS_KEY) {
            HTTP.get("http://transporteservico.urbs.curitiba.pr.gov.br/getPois.php?c=" + process.env.URBS_KEY, {},
                function(error, result) {
                    if (!error) {
                        if ((result.statusCode == 200) && result.content) {
                            Pontos.remove({});

                            pois = JSON.parse(result.content);
                            var vendas = ["BANCA DE REVISTA - CARTÃO TRANSPORTE", "TERMINAL DE TRANSPORTE - CARTÃO TRANSPORTE", "ESTAÇÃO TUBO - CARTÃO TRANSPORTE"];
                            var postos = ["RUA DA CIDADANIA - CARTÃO TRANSPORTE", "POSTOS DE ATENDIMENTO URBS - CARTÃO TRANSPORTE"];

                            pois.forEach(function(poi) {

                                var type = false;
                                if (vendas.indexOf(poi.POI_CATEGORY_NAME) > -1) type = 'venda';
                                if (postos.indexOf(poi.POI_CATEGORY_NAME) > -1) type = 'posto';

                                /* Hack for Keridas presents */
                                if (poi.POI_NAME.indexOf("Kerida Presents") > -1) type = 'venda';

                                if (type) {
                                    str = poi.POI_NAME.split(' - ');
                                    if (str.length == 1) str = poi.POI_NAME.split('- ');

                                    name = str.shift().trim();
                                    if (type == 'posto') str.push(poi.POI_DESC.trim());
                                    desc = str.join('<br />');

                                    doc = {
                                        name: name,
                                        type: type,
                                        lon: poi.POI_LON.replace(',', '.'),
                                        lat: poi.POI_LAT.replace(',', '.'),
                                        address: desc
                                    };
                                    Pontos.insert(doc);
                                    console.log('Inserting Ponto: ' + doc.name);
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
    },

    traceVeiculos: function(linha) {
        if (process.env.URBS_KEY) {
            console.log('Tracing line: ' + linha);

            var t = Date.now();
            HTTP.get("http://transporteservico.urbs.curitiba.pr.gov.br/getVeiculosLinha.php?linha=" + linha + "&c=" + process.env.URBS_KEY, {},
                function(error, result) {
                    console.log('Response received in ' + Math.floor((Date.now() - t) / 1000) + 's');
                    if (!error) {
                        if ((result.statusCode == 200) && result.content) {
                            veiculos = JSON.parse(result.content);
                            veiculos.forEach(function(veiculo) {
                                doc = {
                                    prefix: veiculo.PREFIXO,
                                    line: veiculo.LINHA,
                                    lon: veiculo.LON.replace(',', '.'),
                                    lat: veiculo.LAT.replace(',', '.'),
                                    last_update: veiculo.HORA
                                };

                                if (found = Veiculos.findOne({
                                        prefix: doc.prefix,
                                        line: doc.line
                                    })) {
                                    if (doc.last_update != found.last_update) {
                                        Veiculos.update(found, doc);
                                        console.log('Modifying Vehiculo: ' + doc.prefix + ' (' + doc.line + ') - ' + doc.last_update);
                                    }
                                } else {
                                    Veiculos.insert(doc);
                                    console.log('Inserting Vehiculo: ' + doc.prefix + ' (' + doc.line + ') - ' + doc.last_update);
                                }
                            });

                        }
                    }
                }
            );

        } else {
            console.log('Error: URBS_KEY not defined');
        }

    }
});

Meteor.startup(function() {
    // code to run on server at startup
    Meteor.call("resetear");

    WebApp.connectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
});

/*
    'Rodoferroviária'                   => array('Av. Presidente Affonso Camargo, 330', -25.437040, -49.256569, $postos_default_horarios),
    'Rua da Cidadania Boa Vista'        => array('Av. Paraná, 3600 - Próx. Posto de Saúde 24h - Boa Vista', -25.385353, -49.232734, $postos_default_horarios),
    'Rua da Cidadania Boqueirão'        => array('Terminal do Carmo', -25.500989, -49.236959, $postos_default_horarios),
*/
