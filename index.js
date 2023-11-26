const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const btoa = require('btoa');
const atob = require('atob');

const bot = new TelegramBot(process.env.NODE_APP_BOT_API_KEY, {
    polling: true
});

const salt = process.env.NODE_APP_SALT;

function encodeSecretSantaInfo(info) {
	return btoa(salt + info);
}
  
function decodeSecretSantaInfo(encodedInfo) {
	const decoded = atob(encodedInfo);
	return decoded.replace(salt, '');
}

function createSecretSantaList(users) {
    let shuffledUsers = [...users];
    let list = {};

    // Random shuffle (Fisher-Yates algorithm)
    for (let i = shuffledUsers.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
    }

    // Assign each user a gift recipient
    shuffledUsers.forEach((user, index) => {
        let recipientIndex = (index + 1) % shuffledUsers.length;
        list[user] = shuffledUsers[recipientIndex];
    });
	console.log(list);
    return list;
}
  
bot.onText(/\/игра: (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const usersInput = match[1];
	const users = usersInput.split(',').map(user => user.trim());
  
	if (users.length < 2) {
		bot.sendMessage(chatId, 'Недостатньо друзів 🤕');
		return;
	}
  
	const secretSantaList = createSecretSantaList(users);
  	for (const user in secretSantaList) {
		const encodedInfo = encodeSecretSantaInfo(user + '|' + secretSantaList[user]);
		bot.sendMessage(chatId, `${user}, переходь сюди і дивись кому ти 🎅: https://t.me/${process.env.NODE_APP_BOT_NAME}?start=${encodedInfo}`);
  	}
});
  
bot.onText(/\/start (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const encodedInfo = match[1];
	const decodedInfo = decodeSecretSantaInfo(encodedInfo);
	console.log(msg.from.username);
	const parts = decodedInfo.split('|');

	if (parts.length === 2) {
		let intendedUser = parts[0];
		const santaRecipient = parts[1];

		if (intendedUser.startsWith('@')) {
			intendedUser = intendedUser.substring(1);
		}
		console.log(intendedUser);
		if (msg.from.username === intendedUser) {
		bot.sendMessage(chatId, `Вітаю! Ти 🎅 для ${santaRecipient}`);
		} else {
		bot.sendMessage(chatId, 'Що ти тут забув, козаче/козачка? Це посилання не для тебе. Якщо ви зіштовхнулися з проблемою - напишіть моєму таткові - @nazar_horbunov. Дякую 😉');
		}
	} else {
		bot.sendMessage(chatId, 'Щось пішло не за планом ☠️');
	}
});

console.log('Бот успешно запущен');