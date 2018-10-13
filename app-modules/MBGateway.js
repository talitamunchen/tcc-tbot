// Responsavel por requisitar os valores da URL
// Atualizacao de precos;posicao;lista de ordens pendentes
// Ordem de stop;compra;venda;cancelamento
const request = require("request");
const APIInterface = require("./APIInterface");

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

	this.getBalance = function(callback) {
		const form = {
			'tapi_method': 'get_account_info'
		};

		APIInterface.postToMB(form, callback);
	};

	this.getOrder = function(coinPair, orderId, callback) {
		const form = {
			'tapi_method': 'get_order',
			'coin_pair': coinPair,
			'order_id': orderId
		};

		APIInterface.postToMB(form, callback);
	};

	this.createBuyOrder = function(coinPair, quantity, limitPrice, callback) {
		const form = {
			'tapi_method': 'place_buy_order',
			'coin_pair': coinPair,
			'quantity': quantity,
			'limit_price': limitPrice
		};

		APIInterface.postToMB(form, callback);
	};

	this.createSellOrder = function(coinPair, quantity, limitPrice, callback) {
		const form = {
			'tapi_method': 'place_sell_order',
			'coin_pair': coinPair,
			'quantity': quantity,
			'limit_price': limitPrice
		};

		APIInterface.postToMB(form, callback);
	};

};

module.exports = Gateway;