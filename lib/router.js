// Configurações
Router.configure({
    layoutTemplate: 'layout',
    notFoundTemplate: 'notFound'
});

// Rota principal
Router.route('/', function() {
    this.render('pontos');
}, { name: 'pontos' });

// // Controller Principal
// AdminController = RouteController.extend({
//     layoutTemplate: 'layout',
//     notFoundTemplate: 'notFound',
//
//     onBeforeAction: function() {
//         // Verifica usuário logado
//         if (!Meteor.userId()) {
//             this.redirect('/admin/login');
//         } else {
//             this.next();
//         }
//     }
// });
//
// // Rotas de administração
//
// Router.route('/login', function() {
//     this.render('login');
// }, { name: 'login' });
