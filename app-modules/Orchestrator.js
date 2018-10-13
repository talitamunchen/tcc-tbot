// Recebe as info do mercado e entao faz o processamento dos pedidos (verifica quando é melhor comprar/vender)
// N opera vendido, somente comprado
// Meio de campo com o CHATBOT

const Gateway = require('./MBGateway');
const AnalysisMachine = require('./AnalysisMachine');

const Orchestrator = function () {

	this.init = function () {
		this.gateway = new Gateway(this);
		this.analysisMachine = new AnalysisMachine(this);

		this.gateway.setupPriceUpdater(this.analysisMachine);
	}
};

module.exports = Orchestrator;