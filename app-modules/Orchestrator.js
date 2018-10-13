// Recebe as info do mercado e entao faz o processamento dos pedidos (verifica quando é melhor comprar/vender)
// N opera vendido, somente comprado
// Meio de campo com o CHATBOT

const Gateway = require('./MBGateway');
const APIInterface = require('./APIInterface');

const Orchestrator = function () {

	this.priceUpdated = function (price) {
		console.log(`New Price ${price}`);
	}

	this.init = function () {
		this.gateway = new Gateway(this);
		this.gateway.setupPriceUpdater();
	}
};

module.exports = Orchestrator;