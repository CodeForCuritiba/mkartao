accountsUIBootstrap3.setLanguage('pt-BR');

Meteor.startup(function() {
  console.log(Meteor.settings);
  GoogleMaps.load({ v: '3', key: Meteor.settings.public.gmapApiKey });
});
