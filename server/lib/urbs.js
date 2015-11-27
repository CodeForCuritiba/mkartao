/**
 * URBS
 *
 * Objeto para manipular o webservice da URBS.
 */
URBS = {
    url: 'http://transporteservico.urbs.curitiba.pr.gov.br',
    key: process.env.URBS_KEY,
    get: function(path, callback) {

        if (path.indexOf('?') !== -1) {
            var url = this.url + path + "&c=" + this.key;
        } else {
            var url = this.url + path + "?c=" + this.key;
        }

        var that = this;

console.log(url);

        HTTP.get(url, {},
            function(error, result) {
                if (!error) {
                    if ((result.statusCode == 200) && result.content) {
                        var content = JSON.parse(result.content);
                        callback.apply(that, [false, content]);
                    } else {
                        callback.apply(that, [result.statusCode, false]);
                    }
                } else {
                    console.error('URBS webservice unavailable.');
                }
            }
        );
    }
};
