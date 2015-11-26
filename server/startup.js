// Listen to incoming HTTP requests, can only be used on the server

Meteor.methods({
    init: function() {

        if (process.env.URBS_KEY) {

            // Se não existirem as linhas na base de dados, seleciona pelo webservice da URBS
            if (Linhas.find().count() == 0) {

                console.log('--> Inserindo Linhas a partir do WS da URBS:');

                URBS.get('/getLinhas.php', function(error, rows) {

                    if (error) {
                        throw error.message;
                    }

                    // Cadastra todos os linhas
                    rows.forEach(function(row) {
                        var doc = {
                            cod: row.COD,
                            nome: row.NOME,
                            somente_cartao: row.SOMENTE_CARTAO,
                            categoria_servico: row.CATEGORIA_SERVICO
                        };

                        Linhas.insert(doc);

                        // Seleciona pontos da linha
                        getPontosByLinha(doc);

                    });

                    console.log(Linhas.find().count() + ' Linhas inseridas com sucesso! <-- ');
                });

            }

            // Verifica se os pois já existem no DB
            if (Pois.find().count() == 0) {

                console.log('--> Inserindo Pois a partir do WS da URBS:');

                URBS.get('/getPois.php', function(error, pois) {
                    if (!error) {

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

                                Pois.insert(doc);

                                console.log('Inserting Ponto: ' + doc.name);
                            }

                        });

                        console.log(Pois.find().count() + ' Pois inseridos com sucesso! <--');

                    } else {
                        console.log("Error: URBS webservice unavailable");
                    }
                });
            }

        } else {
            console.log('Error: URBS_KEY not defined');
        }
    },

    traceVeiculos: function(linha) {
        if (process.env.URBS_KEY) {
            console.log('Tracing line: ' + linha);

            var now = Date.now();

            URBS.get('/getVeiculosLinha.php?linha=' + linha, function(error, veiculos) {
                console.log('Response received in ' + Math.floor((Date.now() - now) / 1000) + 's');

                if (error) {
                    console.log('Não foi possível obter informações do veículo');
                }

                veiculos.forEach(function(veiculo) {
                    var doc = {
                        prefixo: veiculo.PREFIXO,
                        linha: veiculo.LINHA,
                        lon: veiculo.LON.replace(',', '.'),
                        lat: veiculo.LAT.replace(',', '.'),
                        updated_at: veiculo.HORA
                    };

                    var found = Veiculos.findOne({
                        prefixo: doc.prefixo,
                        linha: doc.linha
                    });

                    if (found) {
                        if (doc.updated_at != found.updated_at) {
                            Veiculos.update(found, doc);
                            console.log('Modifying Veiculo: ' + doc.prefixo + ' (' + doc.linha + ') - ' + doc.updated_at);
                        }
                    } else {
                        Veiculos.insert(doc);
                        console.log('Inserting Veiculo: ' + doc.prefixo + ' (' + doc.linha + ') - ' + doc.updated_at);
                    }
                });

            });

        } else {
            console.log('Error: URBS_KEY not defined');
        }

    }
});

// code to run on server at startup
Meteor.startup(function() {

    Meteor.call("init");

    // CORS
    WebApp.connectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
});

/**
 * Seleciona através do WebService da URBS os pontos pela linha especificada
 * @param  Document linha Mongo cocument
 * @return integer Count of all inserted points
 */
function getPontosByLinha (linha){
    console.log('--> Inserindo Pontos da linha ' + linha.cod + ' a partir do WS da URBS:');
    URBS.get('/getPontosLinha.php?linha=' + linha.cod, function(error, pontos) {

        if (error) {
            return console.log('Não foi possível obter informações dos pontos da linha ' + linha.cod);
        }

        pontos.forEach(function(ponto) {

            var exists = Pontos.find({ num : ponto.NUM }).count();

            // Verifica se o ponto já existe
            if (exists > 0) {
                return;
            }

            var doc = {
                nome : ponto.NOME,
                num : ponto.NUM,
                lat : ponto.LAT.replace(',','.'),
                lon : ponto.LON.replace(',','.'),
                seq : ponto.SEQ,
                grupo : ponto.GRUPO,
                sentido : ponto.SENTIDO,
                tipo : ponto.TIPO,
            };

            Pontos.insert(doc);
        });


    });
}

/*
    'Rodoferroviária'                   => array('Av. Presidente Affonso Camargo, 330', -25.437040, -49.256569, $postos_default_horarios),
    'Rua da Cidadania Boa Vista'        => array('Av. Paraná, 3600 - Próx. Posto de Saúde 24h - Boa Vista', -25.385353, -49.232734, $postos_default_horarios),
    'Rua da Cidadania Boqueirão'        => array('Terminal do Carmo', -25.500989, -49.236959, $postos_default_horarios),
*/
