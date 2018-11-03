const TelegramBot = require('node-telegram-bot-api');

const BotInterface = function (orquestrator){
    this.orquestrator = orquestrator;
    this.token = process.env.BOT_API_TOKEN;

    this.bot = new TelegramBot(this.token, {polling: true});
    this.chatId = null; // Será preenchido assim que o usuário conectar

    // Matches "/echo [whatever]"
    this.bot.onText(/\/start.*/, (msg, match) => {
        this.chatId = msg.chat.id;
        this.bot.sendMessage(this.chatId, "Bot connected!");
        this.orquestrator.botConnected();
    });
  
    this.sendRequestOrder = function(orderData) {
        this.orderData = orderData;
        const opts = {
            reply_markup: {
                inline_keyboard: [[{text: 'Do it!', callback_data: 'yes'}, {text: 'No, thanks!', callback_data: 'no'}]],
                resize_keyboard: true
            }, parse_mode: 'Markdown'
        };
        const signal = orderData.signal < 0 ? 'SELL':'BUY';
        const message = `Hi, there is an opportunity for *${signal}*\nCoin: ${orderData.coinPair}\nAmount: ${orderData.quantity}\nPrice: ${orderData.limitPrice}`; 
        this.bot.sendMessage(this.chatId, message, opts);
    }

    this.bot.on('callback_query', (query) => {
        const action = query.data;
        const msg = query.message;
        if (query.data == 'yes'){
            this.bot.sendMessage(this.chatId, 'Sending order...');
            this.orquestrator.orderCallback(this.orderData);
        }else{
            this.bot.sendMessage(this.chatId, 'Order discarted!');
            this.orquestrator.orderCallback(null);
        }
        this.orderData = null;
    });
}


module.exports = BotInterface;