// 读取配置和模块
let fs = require("fs");
let yaml = require("js-yaml");
let TelegramBot = require('node-telegram-bot-api');
let proxy = require('proxy-agent');
let oicq = require(`oicq`);

let setting_data = yaml.load(fs.readFileSync('./settings.yml'));
console.log(setting_data);
let rules = JSON.parse(fs.readFileSync('./rules.json'))


let { createClient, segment } = oicq;

// 变量区
const bot_owner = setting_data.bot_owner;
const client = createClient(setting_data.QQ_account, {platform: 4});
let q2tg = {};
let tg2q = {};
let history = {};

// QQ客户端登录
client.on("system.online", () => console.log("Logged in!"));

if (setting_data.QRCode){
    client.on("system.login.qrcode", function () {
        console.log("扫码后按回车登录");
        process.stdin.once("data", () => {
            this.login();
        })
    }).login();
} else {
    client.on("system.login.slider", function () {
        console.log("输入ticket：")
        process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
    }).login(setting_data.password)
}

// TG登录
let bot = new TelegramBot(setting_data.TG_token, {
    polling: true,
    request: {
        agent: proxy("http://127.0.0.1:10809")
    }
});

// client监控区

// 戳一戳
// client.on("notice.group.poke", function (e) {
//     bot.sendMessage(msg.chat.id, "");
// })

/**
 * Escape special chars in txt with '\', @returns the escaped string
 *
 * @param {string} txt - The text to be escaped.
 *
 * @returns {string}
 */
function textEscape(txt) {
    return txt.replaceAll(/[[\]\-\/\\^$*+?.()|{}]/ug, "\\$&");
}

async function oicq2TG(e, chat_id) {
    if (q2tg[chat_id] == false) return;
    let msg_to_send = `${e.sender.nickname}:\n`;
    for (const txt of e.message) {
        if (typeof txt == 'string') {
            msg_to_send += txt;
        } else if (txt.type == 'at') {
            if (rules.user[txt.qq] != undefined) msg_to_send += `@${rules.user[txt.qq]}`;
            else msg_to_send += `${txt.text}`
        } else if (txt.type == "text") {
            msg_to_send += txt.text;
        } else if (txt.type == "image") {
            return await bot.sendPhoto(chat_id, txt.url);
        }
    }
    if (msg_to_send != "") return await bot.sendMessage(chat_id, msg_to_send);
}

client.on("message.group", async function(e) {
    try {
        if (rules.QQ[e.group_id] != undefined) {
            console.log(e);
            history[(await oicq2TG(e, rules.QQ[e.group_id])).message_id] = e;
            console.log(history);
        }
    }
    catch (err) {
        console.error(err);
    }
})



bot.onText(/\/botoff/, msg => {
    q2tg[msg.chat.id] = false;
    bot.sendMessage(msg.chat.id, '转发bot关闭');
})

bot.onText(/\/boton/, msg => {
    q2tg[msg.chat.id] = true;
    bot.sendMessage(msg.chat.id, '转发bot打开');
})

bot.on("message", msg => {
    console.log(msg);
    if(msg.reply_to_message != undefined && msg.text!=undefined && history[msg.reply_to_message.message_id] != undefined) {
        history[msg.reply_to_message.message_id].reply(`${msg.from.first_name}:\n` + msg.text, true);
    }

});
