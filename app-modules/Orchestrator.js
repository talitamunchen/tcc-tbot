// Recebe as info do mercado e entao faz o processamento dos pedidos (verifica quando é melhor comprar/vender)
// N opera vendido, somente comprado
// Meio de campo com o CHATBOT

const AnalysisMachine = require('./AnalysisMachine');
const SimpleMovingAverage = require('./indicators/SimpleMovingAverage');
const MBGateway = require('./MBGateway');
const BotInterface = require('./BotInterface');

//mbGateway.setupPriceUpdater(analysisMachine);

const Orchestrator = function () {
	this.blocked = false;

	this.init = function () {
		this.botInterface = new BotInterface(this); // Abre a botInterface e aguarda usuário conectar com Bot
	}

	this.botConnected = function() {
		this.gateway = new MBGateway(this);
		this.analysisMachine = new AnalysisMachine(this);
		this.analysisMachine.installIndicator(new SimpleMovingAverage(Number(process.env.TREND_PERIOD), Number(process.env.SIGNAL_PERIOD)));

		//this.analysisMachine.fakePrice([180, 179, 178, 175, 174, 174, 185, 195, 196, 199, 198, 190, 190]);
		//this.analysisMachine.fakePrice([170, 171, 170]);
	}

	this.onSignal = function (signal, price) {
		if (this.blocked){
			return console.log(`Blocked, will not execute ${signal == process.env.SIGNAL_BUY ? "buy":"sell"}`);
		}
		this.blocked = true;
		if (signal == process.env.SIGNAL_BUY){
			this.buyOrderChain(price);
		}else{
			this.sellOrderChain(price);
		}
	}

	this.releaseBlock = function () {
		this.blocked = false;
	}

	this.buyOrderChain = function (price) {
		const self = this;
		this.gateway.getBalance(function (err, data){
			if (err){
				console.log(`Error creating buy chain ${err}: ${JSON.stringify(err)}`);
			}
			//console.log(`Data ${JSON.stringify(data, null, 4)}`);
			const balance = Number((Number(data.response_data.balance.brl.available)*process.env.BUY_AMOUNT).toFixed(2)); //comprar apenas X% do valor disponivel
			const coinPair = `BRL${process.env.COIN}`;
			const limitPrice = price * Number(process.env.BUY_SPREAD_MARGIN);
			const quantity = Number(((Math.floor((balance/limitPrice) * 1000000)) / 1000000).toFixed(6));

			//console.log(`Buying ${quantity} ${coinPair} at ${limitPrice} for a total of ${(quantity*limitPrice).toFixed(2)}`);
			
			self.sendRequestForTrade({
				signal: process.env.SIGNAL_BUY,
				coinPair: coinPair,
				quantity: quantity,
				limitPrice: limitPrice
				//graphic
			});
		});
	}

	this.sellOrderChain = function (price) {
		const self = this;
		this.gateway.getBalance(function (err, data){
			if (err){
				console.log(`Error creating sell chain ${err}: ${JSON.stringify(err)}`);
			}
			//console.log(`Data ${JSON.stringify(data, null, 4)}`);
			const quantity = Number(data.response_data.balance[process.env.COIN.toLocaleLowerCase()].available)*(process.env.SELL_AMOUNT); //vende X% do disponivel
			const coinPair = `BRL${process.env.COIN}`;
			const limitPrice = price * Number(process.env.SELL_SPREAD_MARGIN);

			//console.log(`Selling ${quantity} ${coinPair} at ${limitPrice} for a total of ${(quantity*limitPrice).toFixed(2)}`);
			
			self.sendRequestForTrade({
				signal: process.env.SIGNAL_SELL,
				coinPair: coinPair,
				quantity: quantity,
				limitPrice: limitPrice
				//graphic
			});
		});
	}

	this.sendRequestForTrade = function (orderData) {
		this.botInterface.sendRequestOrder(orderData);
	}

	this.orderCallback = function (orderData) {
		if (orderData == null){
			return this.releaseBlock();
		}
		this.gateway.executeOrder(orderData);
	}

	this.orderCompleted = function () {
		this.botInterface.sendGenericMessage('Order *completed*!');
		this.releaseBlock();
	}

	this.orderCancelled = function () {
		this.botInterface.sendGenericMessage('Order *cancelled*!');
		this.releaseBlock();
	}

	this.orderTimeouted = function () {
		this.botInterface.sendGenericMessage('Order *timeouted*!');
		this.releaseBlock();
	}
};

module.exports = Orchestrator;