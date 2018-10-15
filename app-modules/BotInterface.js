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
  
    this.sendMessage = function(msg) {
        this.bot.sendMessage(this.chatId, msg, {
            "reply_markup": {
                "keyboard": [["Autorizado!", "Negadio!"]]
            }
        });
    }
    
}


module.exports = BotInterface;