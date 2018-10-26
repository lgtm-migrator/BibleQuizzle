/*
CREATING BIBLE QUIZZLE TELEGRAM BOT USING telegraf LIBRARY.

REFERENCES:
- https://thedevs.network/blog/build-a-simple-telegram-bot-with-node-js
- https://www.sohamkamani.com/blog/2016/09/21/making-a-telegram-bot/
*/

/* RUNNING IN NODE JS:
1) now -e BOT_TOKEN='633536414:AAENJwkQwYN3TGOe3LmFw2VyJFr8p7dU9II' --public
2) npm start
(Note that (2) will run (1) as defined in the start script)
*/

const { Extra } = require('micro-bot');
const Telegraf  = require('micro-bot');

const bot = new Telegraf(process.env.BOT_TOKEN);

const welcomeMessage = 'Welcome to Bible Quizzle, a fast-paced Bible trivia game similar to Quizzarium!\n\nTo begin the game, type /start in the bot\'s private chat, or in the group. For more information and a list of all commands, type /help';

const helpMessage =
"Bible Quizzle is a fast-paced Bible trivia game. Once the game is started, the bot will send a question. Send in your open-ended answer and the bot will give you points for the right answer. The faster you answer, the more points you get! You can use hints but that costs points.\n\n"+
"/start Starts a new game.\n"+
"/help Displays this help message.\n";

let i = 0;
const categories = ["All","Old Testament","New Testaments","Gospels","Prophets"];

let currentGame = {
	"status": "choosing_category", //choosing_category, choosing_rounds, active
	"category":null
};
let scores = {};
let welcomeMessageSent = false;

bot.start( (ctx) => {
	if(!welcomeMessageSent){
		ctx.reply(welcomeMessage);
		welcomeMessageSent = true;
		console.log("Welcome!");
	}

	//Set category
	console.log("Pick a category: ", categories);

	switch(currentGame.status){
		case "active":
			ctx.reply("A game is already in progress. To stop the game, type /stop");
			break;
		case "choosing_cat":
		case "choosing_category":
			return chooseCategory(ctx);
			break;
		case "choosing_rounds":
			return chooseRounds(ctx);
		default:

			return;
	}
});

let chooseCategory = (ctx) => {
	return ctx.reply('Select a Category', Extra.HTML().markup((m) =>{
		let catArr = [];
		for(i=0;i<categories.length;i++){
			catArr.push(m.inlineButton(categories[i],'set_category'));
		}
		m.inlineKeyboard(catArr);
	}));
}

let chooseRounds = (ctx) => {
	
}

bot.command('stop', ctx => {
});

bot.command('help', ctx => {
	//const extra = Object.assign({}, Composer.markdown());
	ctx.reply(helpMessage);
})

module.exports = bot;
