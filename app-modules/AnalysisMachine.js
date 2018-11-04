//Maquina de analise
const AnalysisMachine = function (orchestrator) {

    this.orchestrator = orchestrator;
    this.indicators = [];
    
    this.priceUpdated = function (price) {
        console.log(`New price = ${price}`);
        for(let i = 0; i < this.indicators.length; i++){
            const indicator = this.indicators[i];
            const signal = indicator.indicatorSignal(price);
            if (signal){
               return this.orchestrator.onSignal(signal, price);
            }
        }
	}

	this.init = function () {
		this.gateway = new Gateway(this);
		this.gateway.setupPriceUpdater();
    }

    this.installIndicator = function (indicator){
        this.indicators.push(indicator);
    }

    this.fakePrice = function (arr) {
        const self = this;
        this.priceUpdated(arr.shift());
        if (arr.length > 0){
            setTimeout(() => {
                self.fakePrice(arr);
            }, 1000);
        }
    }
};

module.exports = AnalysisMachine;