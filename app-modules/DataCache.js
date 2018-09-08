// Comunicacao com banco de dados local

let DataCache = {

	nextMBNonce : function(callback) {
		if (!DataCache.nonce){
			DataCache.nonce = process.env.NONCE;
		}
		const nonce = DataCache.nonce ++;
		console.log(`nonce = ${nonce}`);
		callback(null, nonce);
	}
};
module.exports = DataCache;
