// Recebe as info do mercado e entao faz o processamento dos pedidos (verifica quando é melhor comprar/vender)
// N opera vendido, somente comprado
// Meio de campo com o CHATBOT

const AnalysisMachine = require('./AnalysisMachine');
const SimpleMovingAverage = require('./indicators/SimpleMovingAverage');
const MBGateway = require('./MBGateway');
const BotInterface = require('./BotInterface');

const Orchestrator = function () {
	this.blocked = false;

	this.init = function () {
		this.botInterface = new BotInterface(this); // Abre a botInterface e aguarda usuário conectar com Bot
	}

	this.botConnected = function () {
		console.log('Bot connected. Pulling data from market...');
		this.gateway = new MBGateway(this);
		this.analysisMachine = new AnalysisMachine(this);
		this.analysisMachine.installIndicator(new SimpleMovingAverage(Number(process.env.TREND_PERIOD), Number(process.env.SIGNAL_PERIOD)));
		//this.gateway.setupPriceUpdater(this.analysisMachine);
	}

	this.createFakeBuyPrices = function(target) {
		let fakePrices = [];
		for(let i = target + 10; i >= target - 10; i--) {
			fakePrices.push(i);
		}
		fakePrices.push(target -1);
		fakePrices.push(target);
		fakePrices.push(target + 1);
		this.analysisMachine.clearData();
		this.analysisMachine.fakePrice(fakePrices);
	}

	this.createFakeSellPrices = function(target) {
		let fakePrices = [];
		for(let i = target - 10; i <= target + 10; i++) {
			fakePrices.push(i);
		}
		fakePrices.push(target + 1);
		fakePrices.push(target + 0);
		fakePrices.push(target - 1);
		this.analysisMachine.clearData();
		this.analysisMachine.fakePrice(fakePrices);
	}

	this.cancelAllOrders = function () {
		this.gateway.cancelAllOrders();
	}

	this.requestBalance = function () {
		const self = this;
		this.gateway.getBalance(function (err, data){
			if (err){
				return self.botInterface.sendGenericMessage(`Error looking for balance.`);
			}
			const msg = `Balance\nR$ ${data.response_data.balance.brl.total}\n${process.env.COIN} ${data.response_data.balance[process.env.COIN.toLowerCase()].total}`;
			self.botInterface.sendGenericMessage(msg);
		});
	}

	this.onSignal = function (signal, price, chartData) {
		if (this.blocked){
			this.botInterface.sendGenericMessage(`Blocked by another pending order.`);
			return console.log(`Blocked, will not execute ${signal == process.env.SIGNAL_BUY ? "buy":"sell"}`);
		}
		this.blocked = true;
		if (signal == process.env.SIGNAL_BUY){
			this.buyOrderChain(price, chartData);
		}else{
			this.sellOrderChain(price, chartData);
		}
	}

	this.releaseBlock = function () {
		this.blocked = false;
	}

	this.buyOrderChain = function (price, chartData) {
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
			const orderVolume = quantity * limitPrice;

			const minVolume = Number(process.env.MIN_BRL_BALANCE_TO_BUY);

			if (balance < minVolume){
				self.botInterface.sendGenericMessage(`Can't buy, min balance of R$ ${minVolume} and have R$ ${data.response_data.balance.brl.available}`);
			}else if (orderVolume < minVolume) {
				self.botInterface.sendGenericMessage(`Can't buy, min volume of R$ ${process.env.MIN_BRL_BALANCE_TO_BUY} and order of R$ ${orderVolume}`);
			}else{
				self.sendRequestForTrade({
					signal: process.env.SIGNAL_BUY,
					coinPair: coinPair,
					quantity: quantity,
					limitPrice: limitPrice,
					chartData: chartData
				});
			}

			
		});
	}

	this.sellOrderChain = function (price, chartData) {
		const self = this;
		this.gateway.getBalance(function (err, data){
			if (err){
				console.log(`Error creating sell chain ${err}: ${JSON.stringify(err)}`);
			}
			//console.log(`Data ${JSON.stringify(data, null, 4)}`);
			const balance = Number(data.response_data.balance[process.env.COIN.toLocaleLowerCase()].available);
			const quantity = balance * (process.env.SELL_AMOUNT); //vende X% do disponivel
			const coinPair = `BRL${process.env.COIN}`;
			const limitPrice = price * Number(process.env.SELL_SPREAD_MARGIN);

			//console.log(`Selling ${quantity} ${coinPair} at ${limitPrice} for a total of ${(quantity*limitPrice).toFixed(2)}`);
			
			const minVolume = process.env.MIN_COIN_BALANCE_TO_SELL;

			if (balance < minVolume){
				self.botInterface.sendGenericMessage(`Can't sell, min balance of ${process.env.COIN} ${minVolume} and have R$ ${balance}`);
			}else if (quantity < minVolume){
				self.botInterface.sendGenericMessage(`Can't sell, min volume of ${process.env.COIN} ${minVolume} and order of R$ ${quantity}`);	
			}else{
				self.sendRequestForTrade({
					signal: process.env.SIGNAL_SELL,
					coinPair: coinPair,
					quantity: quantity,
					limitPrice: limitPrice, 
					chartData: chartData
				});
			}
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