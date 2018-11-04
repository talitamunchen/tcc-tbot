// Camada de comunicaco de rede com a API
// Conversa com a API da corretora

const request       = require(`request`);
const querystring   = require(`querystring`);
const crypto        = require(`crypto`);

const DataCache     = require(`./DataCache`);

let APIInterface = {

postToMB : function(form, callback) {
		let retry = 3;
		DataCache.nextMBNonce(function(err, nonce) {
			if (err){
				return callback(err);
			}
			form.tapi_nonce = nonce;

			// Hash das informacoes para garantia de integridade
			let path = '/tapi/v3/';
			let formData = querystring.stringify(form);
			let contentLength = formData.length;
			let tapi_mac = crypto.createHmac(`sha512`, process.env.TAPI_SECRET).update(`${path}?${formData}`).digest(`hex`);

			// Despachar o form
			request.post({
				url: `https://www.mercadobitcoin.net/tapi/v3/`,
				headers: {
					'TAPI-ID': process.env.TAPI_KEY,
					'TAPI-MAC': tapi_mac,
					'Content-Length': contentLength,
					'Content-Type': `application/x-www-form-urlencoded`
				},
				body: formData,
				json: true
			}, (err, response, body) => {
				if(err) {
					return callback(err);
				} else if (body.status_code == 100) { //Success
					return callback(null, body);
				}else{
					if(body.status_code == 429) {
						if(retry > 0) {
							console.log(`Error 429 - Retrying in... ${process.env.RETRY_TIMEOUT}`);
							setTimeout(function() {
								APIInterface.postToMB(form, retry - 1, callback);
							}, process.env.RETRY_TIMEOUT);
						} else {
							return callback({status_code: body.status_code, body: body});
						}
					} else {
						return callback({status_code: body.status_code, body: body});
					}
				}
			});
		});
    }
}

module.exports = APIInterface;