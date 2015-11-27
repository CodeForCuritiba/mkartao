Meteor.methods({
  getTabelaByVeiculo: function(prefixo) {
    var veiculo = Veiculos.find({
      prefixo: prefixo
    }).fetch()[0];

    // Verifica se a tabela do veículo já foi importada
    if (veiculo.tabela && veiculo.tabela.length >= 1) {
      return false;
    }

    // Importa a tabela
    URBS.get('/getTabelaVeiculo.php?carro=' + prefixo, function(error, rows) {
      var tabela = [];

      rows.forEach(function(obj) {
        tabela.push({
          veiculo: obj.VEICULO,
          horario: obj.HORARIO,
          tabela: obj.TABELA,
          cod_ponto: obj.COD_PONTO,
        });
      });

      var update = Veiculos.update({
        prefixo: prefixo
      }, {
        $set: {
          tabela: tabela
        }
      });

    });
  }
});
