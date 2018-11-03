// Responsavel por requisitar os valores da URL
// Atualizacao de precos;posicao;lista de ordens pendentes
// Ordem de stop;compra;venda;cancelamento
const request = require("request");
const APIInterface = require("./APIInterface");

const Gateway = function(orquestrator) {
	this.orquestrator = orquestrator;

	this.REQUEST_PRICE_URL = `https://www.mercadobitcoin.net/api/${process.env.COIN}/ticker/`;

	this.requestPrice = function(analysisMachine) {
		const self = this;

		request.get(this.REQUEST_PRICE_URL, {
			timeout: process.env.GATEWAY_REQUEST_PRICE_TIMEOUT
		}, function(err, response, body){
			if (err){
				console.log(`Erro ao carregar dados de preco: ${err}`);
			}else{
				const parsedBody = JSON.parse(body);
				const price = Number(parsedBody.ticker.last);
				analysisMachine.priceUpdated(price);
			}
			self.setupPriceUpdater(analysisMachine);
		});
	};

	this.setupPriceUpdater = function(analysisMachine) {
		const self = this;

		setTimeout(function() {
			self.requestPrice(analysisMachine);
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

	this.listOrders = function(coinPair, callback) {
		const form = {
			'tapi_method': 'list_orders',
			'coin_pair': coinPair,
			'status_list': '[2]' // open orders only
		};

		APIInterface.postToMB(form, callback);
	};

	this.cancelOrder = function(coinPair, orderId, callback) {
		const form = {
			'tapi_method': 'cancel_order',
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

	this.executeOrder = function(orderData) {
		const self = this;
		//  create buy/sell order
		console.log(JSON.stringify(orderData));
		if (orderData.signal == process.env.SIGNAL_BUY){
			console.log('Buying...');
			this.createBuyOrder(orderData.coinPair, orderData.quantity, orderData.limitPrice, function (err, data){
				if (err){
					return console.log(`Error: ${JSON.stringify(err)}`);
				}
				
				const orderId = data.response_data.order.order_id;
				const createdTime = Number(data.response_data.order.created_timestamp)*1000; //transformando unix timestamp to milissegundos
				const monitorInterval = Number(process.env.ORDER_MONITOR_INTERVAL);

				setTimeout(function () {
					self.monitorOrder(orderId, createdTime);
				}, monitorInterval);
			});
		}else{
			console.log('Selling...');
			this.createSellOrder(orderData.coinPair, orderData.quantity, orderData.limitPrice, function (err, data){
				if (err){
					return console.log(`Error: ${JSON.stringify(err)}`);
				}
				
				const orderId = data.response_data.order.order_id;
				const createdTime = Number(data.response_data.order.created_timestamp)*1000; //transformando unix timestamp to milissegundos
				const monitorInterval = Number(process.env.ORDER_MONITOR_INTERVAL);

				setTimeout(function () {
					self.monitorOrder(orderId, createdTime);
				}, monitorInterval);
			});
		}
	};

	this.monitorOrder= function (orderId, createdTime) {
		const self = this;
		const coinPair = `BRL${process.env.COIN}`;

		this.getOrder(coinPair, orderId, function (err, data) {
			if (err){
				return console.log(`Error: ${JSON.stringify(err)}`);
			}
			//console.log(JSON.stringify(data, null, 4));
			
			const orderStatus = data.response_data.order.status;
			if (orderStatus == 4){ //order completed
				self.orquestrator.orderCompleted();
			}else if (orderStatus == 3){ //order cancelled
				self.orquestrator.orderCancelled();
			}else{ //2 order open
				const timeoutTime = createdTime + Number(process.env.ORDER_MONITOR_TIMEOUT);
				const now = new Date().getTime();

				if (now > timeoutTime){
					self.cancelOrder(coinPair, orderId, function (err, data){
						self.orquestrator.orderTimeouted();
						if (err){
							return console.log(`Error: ${JSON.stringify(err)}`);
						}
						//console.log(JSON.stringify(data, null, 4));
					});
				}else{
					const monitorInterval = Number(process.env.ORDER_MONITOR_INTERVAL);
					//console.log('Not yet');

					setTimeout(function () {
						self.monitorOrder(orderId, createdTime);
					}, monitorInterval);
				}
			}
		});
	}

};

module.exports = Gateway;