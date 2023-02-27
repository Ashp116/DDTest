import {GoogleSpreadsheet} from 'google-spreadsheet';
import {
 Client,
 GatewayIntentBits,
 Partials,
 SlashCommandBuilder,
 Routes,
 ChatInputCommandInteraction, CacheType, EmbedBuilder
} from 'discord.js';
import * as fs from "fs";
import {config} from "dotenv"
const { REST } = require('@discordjs/rest');


const doc: GoogleSpreadsheet = new GoogleSpreadsheet('1QncPrNNsmINTNtmmtun5mXwmkV8p3efwCcyLXmLSXhU');
console.log(process.env.Token)
const key = process.env.key
const Token = process.env.Token
const rest = new REST({ version: '10' }).setToken(Token);
const client = new Client({  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildInvites,GatewayIntentBits.GuildMessageReactions,GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
 partials: [Partials.Message, Partials.Channel, Partials.Reaction] });
client.login(Token);

doc.useApiKey(key);

let commandsUtil = {}
let commandsRegister = []

fs.readdir("./out/Commands/", (err, files) => {
 if (err) console.error(err);

 let jsfiles = files.filter(f => f.split(".").pop() === "js");
 if (jsfiles.length <= 0) {
  console.log("No commands to load");
  return;
 }

 jsfiles.forEach((f, i) => {
  let props = require(`./Commands/${f}`);
  console.log(`${i+1}: ${f} loaded!`)

  commandsUtil[f.split(".").shift().toLowerCase()] = props

  if (props.command) {
   commandsRegister.push(props.command)
  }

 });
});


client.on('ready', async () => {
 let Status = new EmbedBuilder()
     .setTitle(`Status: Online`)
     .setColor("#00ff32")
     .setThumbnail(client.user.displayAvatarURL())
     .setAuthor({iconURL: client.user.displayAvatarURL(), name: client.user.username})
     .setDescription(`Bot is online!`)
     .setTimestamp()
 let server = await client.guilds.cache.get("1079556613578444800")
 // @ts-ignore
 await server.channels.cache.get("1079623589227151381").send({embeds: [Status]})


 console.log(`Logged in as ${client.user.tag}!`);

 // Loop over all the guilds
 let guildIds =  client.guilds.cache.map(guild => guild.id);
 let guilds =  client.guilds.cache.map(guild => guild);

 guilds.forEach((guild) => {
  console.log(guild.id, guild.name)
 })
 try {
  console.log('Started refreshing application (/) commands.');

  for (let i in guildIds) {

   await rest.put(
       Routes.applicationGuildCommands("1079592892185706558", guildIds[i]),
       { body: commandsRegister },
   );
  }

  console.log('Successfully reloaded application (/) commands.');
 } catch (error) {
  console.error(error);
 }
});

client.on('messageReactionAdd', async (reaction, user) => {
 let message = reaction.message
 let roles = [
  reaction.message.guild.roles.cache.get("983051585036881930"), // Update Ping
  reaction.message.guild.roles.cache.get("983051582415437904"), // Announcement Ping
  reaction.message.guild.roles.cache.get("983051579894677524"), // Group Announcement Ping
 ]

 let member = message.guild.members.cache.get(user.id)

 if (message.id === "1004894572385669161") {
  if (reaction.emoji.name === "1️⃣") {
   await member.roles.add(roles[0])
  }
  else if (reaction.emoji.name === "2️⃣") {
   await member.roles.add(roles[1])
  }
  else if (reaction.emoji.name === "3️⃣") {
   await member.roles.add(roles[2])
  }
 }
});

client.on('messageReactionRemove', async (reaction, user) => {
 let message = reaction.message
 let roles = [
  reaction.message.guild.roles.cache.get("983051585036881930"), // Update Ping
  reaction.message.guild.roles.cache.get("983051582415437904"), // Announcement Ping
  reaction.message.guild.roles.cache.get("983051579894677524"), // Group Announcement Ping
 ]

 let member = message.guild.members.cache.get(user.id)

 if (message.id === "1004894572385669161") {
  if (reaction.emoji.name === "1️⃣") {
   await member.roles.remove(roles[0])
  }
  else if (reaction.emoji.name === "2️⃣") {
   await member.roles.remove(roles[1])
  }
  else if (reaction.emoji.name === "3️⃣") {
   await member.roles.remove(roles[2])
  }
 }
});

client.on('interactionCreate', async interaction => {
 if (interaction.isChatInputCommand()) {
  let embed = new EmbedBuilder()
      .setTitle(`Instructions`)
      .setColor("#ff4747")
      .setDescription(`Use the command ${"`/verify`"} in <#1079577143081717800>
      
      Verify with your **First Name** and **Last Name** that your have registered with the team.
      
      ***If your not in the team, or you aren't able to verify, please contact on of the mentors!***
      
      *Any problems please contact <@1079558175524671508>*
      `)

  // @ts-ignore
  //client.guilds.cache.get("1079556613578444800").channels.cache.get("1079577143081717800").send({embeds: [embed]})
  const command: Command = commandsUtil[interaction.commandName.toLowerCase()]
  if (command) {
   command.execute(interaction, client, doc)
  }
 }
});

type Command = {
 name: string,
 command: JSON,
 execute: (interaction: ChatInputCommandInteraction<CacheType>, client: Client, doc: GoogleSpreadsheet) => null
}
