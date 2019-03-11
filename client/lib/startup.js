accountsUIBootstrap3.setLanguage('pt-BR');

Meteor.startup(function() {
  GoogleMaps.load({ v: '3', key: Meteor.settings.public.gmapApiKey });
});
