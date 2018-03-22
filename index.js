require('dotenv').config();

const cheerio = require('cheerio');

const TelegramBot = require('node-telegram-bot-api');

const config = require('config/config');

// replace the value below with the Telegram token you receive from @BotFather
const token = config.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token);

const request = require('request');

const CronJob = require('cron').CronJob;

const getData = (host) => {
  return new Promise((resolve, reject) => {
    request(`${host}issues`, (err, response, body) => {
      if (err) {
        reject(err);
      }
      resolve(body);
    });
  })
};

const sendWeekly = async (host) => {
  const body = await getData(host);

  const $ = cheerio.load(body);

  const lastIssue = $('.issue')[0];
  const href = lastIssue.children[0].attribs.href;

  const url = `${host}${href}`;

  await(bot.sendMessage(config.TELEGRAM_CHAT_ID, 'Node weekly ' + url));
};

new CronJob(process.env.CRON_TIME, async () => {
    await(sendWeekly('https://nodeweekly.com/'));
    await(sendWeekly('https://javascriptweekly.com/'));
  },
  null,
  true, /* Start the job right now */
  process.env.CRON_TIMEZONE/* Time zone of this job. */
);