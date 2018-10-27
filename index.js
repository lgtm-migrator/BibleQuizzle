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

//Initialising of Libraries
const { Markup, Extra } = require('micro-bot');
const Telegraf  = require('micro-bot');

const bot = new Telegraf(process.env.BOT_TOKEN, { username: "@BibleQuizzleBot"});
bot.use(Telegraf.log());

const fs = require('fs');

const welcomeMessage = 'Welcome to Bible Quizzle, a fast-paced Bible trivia game similar to Quizzarium!\n\nTo begin the game, type /start in the bot\'s private chat, or in the group. For more information and a list of all commands, type /help';

const helpMessage =
"Bible Quizzle is a fast-paced Bible trivia game. Once the game is started, the bot will send a question. Send in your open-ended answer and the bot will give you points for the right answer. The faster you answer, the more points you get! You can use hints but that costs points.\n\n"+
"/start Starts a new game.\n"+
"/help Displays this help message.\n";

let i = 0,j=0;
const categories = ["All","Old Testament","New Testament","Gospels","Prophets","Miracles"];

//Make Category Array from `categories`
let catArr = [], rowArr = [];
catArr[0] = ["📖 "+categories[0]]; //First row is single "All" button
const nButtonsOnARow = 2;
for(i=1;i<categories.length;i+=nButtonsOnARow){
	rowArr = [];
	for(j=0;j<nButtonsOnARow;j++){
		if(i+j<categories.length)
			rowArr.push("📖 "+categories[i+j]);
	}
	catArr.push(rowArr);
}

//Initialise question object
let questions = {};
compileQuestionsList = ()=>{
	questions["all"] = JSON.parse(fs.readFileSync('questions.json', 'utf8')).questions;

	let all_questions = questions["all"];
	//TODO: Get by category
	for(i in all_questions){
		let _cats = all_questions[i].categories;
		for(j=0;j<_cats.length;j++){
			let _cat = _cats[j].toString();
			if( !questions.hasOwnProperty(_cat) ){ //Key doesn't exist
				questions[_cat] = [];
			}

			questions[_cat].push(all_questions[i]);
		}
	}
}

compileQuestionsList();

//Initialise Current Game object
let currentGame;

resetGame = ()=>{
	currentGame = {
		"status": "choosing_category", //choosing_category, choosing_rounds, active
		"category":null,
		"currRound":0,
		"totalRounds":10,
		"currQuestion":-1
	};
}; resetGame();

let scores = {};

//Start Game function
startGame = (ctx)=>{
	currentGame.status = "active";
	currentGame.currRound = 1;

	for(i=0;i<questions[currentGame.category].length;i++){
		ctx.reply(i+": "+questions[currentGame.category][i]["question"]);
	}
};

//Begin Command and Control
bot.command('start', (ctx) => {
	//ctx.reply(welcomeMessageSent?"Welcome Message Sent before":"Welcome Message not sent before");

	//Send welcome message on first send
	/*if(!welcomeMessageSent){
		ctx.reply(welcomeMessage);
		welcomeMessageSent = true;
		console.log("Welcome!");
		return;
	}*/

	//Set category
	console.log("Pick a category: ", categories);

	switch(currentGame.status){
		case "active":
			return ctx.reply("A game is already in progress. To stop the game, type /stop");
		case "choosing_cat":
		case "choosing_category":
			return chooseCategory(ctx);
		case "choosing_rounds":
			return chooseRounds(ctx);
			return;
		default:
			currentGame.status = "choosing_category";
			return;
	}
});

let chooseCategory = (ctx) => {
	return ctx.reply(
		'Pick a Category: ',
		Extra.inReplyTo(ctx.message.message_id).markup(
			Markup.keyboard(catArr)
			.oneTime().resize()
		)
	);
};

let chooseRounds = (ctx) => {
	return ctx.reply(
		'Number of Rounds: ',
		Extra.inReplyTo(ctx.message.message_id).markup(
			Markup.keyboard([
				["🕐 10","🕑 20"],
				["🕔 50","🕙 100"]
			])
			.oneTime().resize()
		)
	);
};

//Setting of rounds and categories
bot.hears(/📖 (.+)/, (ctx)=>{ //Category Setting
	currentGame.category = ctx.match[ctx.match.length-1].toLowerCase().split(" ").join("_");
	chooseRounds(ctx);
});

bot.hears(/(🕐|🕑|🕔|🕙)(.\d+)/, (ctx)=>{ //Round Setting
	currentGame.totalRounds = parseInt(ctx.match[ctx.match.length-1]);

	//ctx.reply("Starting game with category "+currentGame.category+", "+currentGame.totalRounds+" rounds");

	startGame(ctx);
});

bot.command('stop', ctx => {
	resetGame();
});

bot.command('help', ctx => {
	//const extra = Object.assign({}, Composer.markdown());
	ctx.reply(helpMessage);
})

module.exports = bot;
