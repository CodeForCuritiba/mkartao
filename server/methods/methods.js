Meteor.methods({
  getTabelaByVeiculo:function(prefixo){
     var veiculo = Veiculos.find({ prefixo : prefixo }).fetch()[0];

     if (!veiculo.tabela || veiculo.tabela.length === 0) {
       URBS.get('/getTabelaVeiculo.php?carro=' + prefixo, function(error, rows){
         var tabela = [];

         rows.forEach(function(obj){
           tabela.push({
             cod_linha : obj.COD_LINHA,
             nome_linha : obj.NOME_LINHA,
             veiculo : obj.VEICULO,
             horario : obj.HORARIO,
             tabela : obj.TABELA,
             cod_ponto : obj.COD_PONTO,
           });
         });

         Veiculos.update({ prefixo : prefixo }, { $set:{
           tabela : tabela
         }});

       });
     }
  }
});
