// Comunicacao com banco de dados local
const fs = require('fs');

let DataCache = {

	nextMBNonce : function(callback) {
		if (!DataCache.nonce){
			DataCache.nonce = fs.readFileSync('.cache', 'utf8');
		}
		const nonce = DataCache.nonce ++;
		fs.writeFile('.cache', DataCache.nonce, 'utf8', callback);
	}
};
module.exports = DataCache;
