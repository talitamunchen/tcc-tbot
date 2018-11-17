const ChartjsNode = require('chartjs-node');
const fs = require('fs');

const SimpleMovingAverage = function (trendPeriod, signalPeriod){
    this.trendPeriod = trendPeriod;
    this.signalPeriod = signalPeriod;
    this.prices = [];

    this.lastCross = null;
    this.CROSS_HIGH = 1;
    this.CROSS_LOW = -1;

    //Assimila um novo preco > executa algoritmo > emite sinal
    this.indicatorSignal = function (price, callback){
        this.prices.push(price);
        if (this.prices.length < trendPeriod){ //nao ha valores suficientes?
            return callback(null); //nenhum sinal
        }else if (this.prices.length > trendPeriod){ //ha valores demais?
            this.prices.shift(); //remove o mais antigo
        }

        //calcula medias
        const signalPrices = this.prices.slice(trendPeriod - signalPeriod);
        const trendAverage = this.calcAverage(this.prices); //tendencia
        const signalAverage = this.calcAverage(signalPrices); //sinal

        //console.log(`${JSON.stringify(this.prices)} - ${JSON.stringify(signalPrices)}`);
        //console.log(`${trendAverage} - ${signalAverage}`);

        if (trendAverage == signalAverage){
            return callback(null); //nenhum sinal
        }else{
            const cross = (signalAverage > trendAverage) ? this.CROSS_HIGH:this.CROSS_LOW;
            if (this.lastCross && this.lastCross != cross){
                this.lastCross = cross;
                const signal = (cross == this.CROSS_HIGH) ? process.env.SIGNAL_BUY:process.env.SIGNAL_SELL; //1 = buy and -1 = sell
                return this.createChart(function (chartData){
                    callback ({
                        signal: signal, //compra ou venda
                        price: price, //ultimo preco, preco que disparou o sinal
                        chartData: chartData
                    });
                });
            }else{
                this.lastCross = cross;
                return callback(null);
            }
        }
    }
    
    this.calcAverage = function (arr) {
        let sum = 0;
        arr.forEach(e => {
            sum += e;
        });
        return sum/arr.length;
    }

    this.createChart = function (callback) {
        const chartNode = new ChartjsNode(600, 600);
        return chartNode.drawChart({
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
                labels: ["11:00", "11:01", "11:02", "11:03", "11:04", "11:04", "11:05"],
                datasets: [
                    {
                        label: "Trend",
                        borderColor: 'rgb(255, 0, 0)',
                        data: [0, 10, 5, 3, 20, 30, 45],
                    },
                    {
                        label: "Signal",
                        borderColor: 'rgb(255, 0, 255)',
                        data: [0, 15, 8, 2, 15, 20, 34],
                    },
                    {
                        label: "Price",
                        borderColor: 'rgb(255, 255, 0)',
                        data: [0, 12, 3, 0, 22, 37, 30],
                    }
                ]
            }, 
            options: {
    
            }
        })
        // CALL JUST AFTER WHEN THE DRAW WAS FINISHED
        .then(buffer => {
            return chartNode.getImageStream('image/png');
        })
        .then((stream) => {
            return chartNode.writeImageToFile('image/png', './testimage.png');
        })
        .then(() => {
            chartNode.destroy(); //memory save 
            const chartData = fs.readFileSync('./testimage.png');
            fs.unlinkSync('./testimage.png');
            callback(chartData);
        });    
    }
}

module.exports = SimpleMovingAverage;
