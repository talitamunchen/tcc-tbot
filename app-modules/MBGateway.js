// Responsavel por requisitar os valores da URL
// Atualizacao de precos;posicao;lista de ordens pendentes
// Ordem de stop;compra;venda;cancelamento
const request = require("request");

const Gateway = function(orchestrator) {

	this.REQUEST_PRICE_URL = 'https://www.mercadobitcoin.net/api/BTC/ticker/';
	this.orchestrator = orchestrator;

	this.requestPrice = function() {
		const self = this;

		request.get(this.REQUEST_PRICE_URL, {
			timeout: process.env.GATEWAY_REQUEST_PRICE_TIMEOUT
		}, function(err, response, body){
			if (err){
				console.log(`Erro ao carregar dados de preco: ${err}`);
			}else{
				const parsedBody = JSON.parse(body);
				orchestrator.priceUpdated(parsedBody.ticker.last);
			}
			self.setupPriceUpdater();
		});
	};

	this.setupPriceUpdater = function() {
		const self = this;

		setTimeout(function() {
			self.requestPrice();
		}, process.env.GATEWAY_TICKER_UPDATE_INTERVAL);
	};

};

module.exports = Gateway;