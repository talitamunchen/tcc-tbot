const AnalysisMachine = function (orquestrator) {

    this.orquestrator = orquestrator;
    this.indicators = [];
    
    this.priceUpdated = function (price) {
        for(let i = 0; i < this.indicators.length; i++){
            const indicator = this.indicators[i];
            const signal = indicator.indicatorSignal(price);
            if (signal){
                if (signal > 0){
                    return console.log(`Compra = ${price}`);
                }else{
                    return console.log(`Vende = ${price}`);
                }
               // return this.orquestrator.onSignal(signal);
            }
        }
	}

	this.init = function () {
		this.gateway = new Gateway(this);
		this.gateway.setupPriceUpdater();
    }
    
    this.gambi = function (){
        const fakePrices = [1, 2, 3, 4, 6, 8, 9, 11, 13, 3, 5, 6, 7, 8, 9, 20];
        fakePrices.forEach(p => {
            this.priceUpdated(p);
        });
    }

    this.installIndicator = function (indicator){
        this.indicators.push(indicator);
    }
};

module.exports = AnalysisMachine;