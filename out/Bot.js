"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_spreadsheet_1 = require("google-spreadsheet");
const discord_js_1 = require("discord.js");
const fs = require("fs");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { REST } = require('@discordjs/rest');
const doc = new google_spreadsheet_1.GoogleSpreadsheet('1QncPrNNsmINTNtmmtun5mXwmkV8p3efwCcyLXmLSXhU');
const key = process.env.key;
const Token = process.env.Token;
const rest = new REST({ version: '10' }).setToken(Token);
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMembers, discord_js_1.GatewayIntentBits.MessageContent, discord_js_1.GatewayIntentBits.GuildInvites, discord_js_1.GatewayIntentBits.GuildMessageReactions, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.DirectMessages],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction] });
client.login(Token);
doc.useApiKey(key);
let commandsUtil = {};
let commandsRegister = [];
fs.readdir("./out/Commands/", (err, files) => {
    if (err)
        console.error(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length <= 0) {
        console.log("No commands to load");
        return;
    }
    jsfiles.forEach((f, i) => {
        let props = require(`./Commands/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        commandsUtil[f.split(".").shift().toLowerCase()] = props;
        if (props.command) {
            commandsRegister.push(props.command);
        }
    });
});
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    let Status = new discord_js_1.EmbedBuilder()
        .setTitle(`Status: Online`)
        .setColor("#00ff32")
        .setThumbnail(client.user.displayAvatarURL())
        .setAuthor({ iconURL: client.user.displayAvatarURL(), name: client.user.username })
        .setDescription(`Bot is online!`)
        .setTimestamp();
    let server = yield client.guilds.cache.get("1079556613578444800");
    // @ts-ignore
    yield server.channels.cache.get("1079623589227151381").send({ embeds: [Status] });
    console.log(`Logged in as ${client.user.tag}!`);
    // Loop over all the guilds
    let guildIds = client.guilds.cache.map(guild => guild.id);
    let guilds = client.guilds.cache.map(guild => guild);
    guilds.forEach((guild) => {
        console.log(guild.id, guild.name);
    });
    try {
        console.log('Started refreshing application (/) commands.');
        for (let i in guildIds) {
            yield rest.put(discord_js_1.Routes.applicationGuildCommands("1079592892185706558", guildIds[i]), { body: commandsRegister });
        }
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
}));
client.on('messageReactionAdd', (reaction, user) => __awaiter(void 0, void 0, void 0, function* () {
    let message = reaction.message;
    let roles = [
        reaction.message.guild.roles.cache.get("983051585036881930"),
        reaction.message.guild.roles.cache.get("983051582415437904"),
        reaction.message.guild.roles.cache.get("983051579894677524"), // Group Announcement Ping
    ];
    let member = message.guild.members.cache.get(user.id);
    if (message.id === "1004894572385669161") {
        if (reaction.emoji.name === "1️⃣") {
            yield member.roles.add(roles[0]);
        }
        else if (reaction.emoji.name === "2️⃣") {
            yield member.roles.add(roles[1]);
        }
        else if (reaction.emoji.name === "3️⃣") {
            yield member.roles.add(roles[2]);
        }
    }
}));
client.on('messageReactionRemove', (reaction, user) => __awaiter(void 0, void 0, void 0, function* () {
    let message = reaction.message;
    let roles = [
        reaction.message.guild.roles.cache.get("983051585036881930"),
        reaction.message.guild.roles.cache.get("983051582415437904"),
        reaction.message.guild.roles.cache.get("983051579894677524"), // Group Announcement Ping
    ];
    let member = message.guild.members.cache.get(user.id);
    if (message.id === "1004894572385669161") {
        if (reaction.emoji.name === "1️⃣") {
            yield member.roles.remove(roles[0]);
        }
        else if (reaction.emoji.name === "2️⃣") {
            yield member.roles.remove(roles[1]);
        }
        else if (reaction.emoji.name === "3️⃣") {
            yield member.roles.remove(roles[2]);
        }
    }
}));
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isChatInputCommand()) {
        let embed = new discord_js_1.EmbedBuilder()
            .setTitle(`Instructions`)
            .setColor("#ff4747")
            .setDescription(`Use the command ${"`/verify`"} in <#1079577143081717800>
      
      Verify with your **First Name** and **Last Name** that your have registered with the team.
      
      ***If your not in the team, or you aren't able to verify, please contact on of the mentors!***
      
      *Any problems please contact <@1079558175524671508>*
      `);
        // @ts-ignore
        //client.guilds.cache.get("1079556613578444800").channels.cache.get("1079577143081717800").send({embeds: [embed]})
        const command = commandsUtil[interaction.commandName.toLowerCase()];
        if (command) {
            command.execute(interaction, client, doc);
        }
    }
}));
