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
const discord_js_1 = require("discord.js");
const commandName = "verify";
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Verification if you are a benzene bots team member')
    .addStringOption(option => option.setName('first_name')
    .setDescription('Your first name that you registered to the team')
    .setRequired(true))
    .addStringOption(option => option.setName('last_name')
    .setDescription('Your last name that you registered to the team')
    .setRequired(true));
function bold(str) {
    return `**${str}**`;
}
function Verify(doc, FirstName, LastName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = yield sheet.getRows();
        yield sheet.loadCells();
        for (let i = 0; i < rows.length; i++) {
            let value = rows[i];
            let row = value.a1Range.toString().replace("'Form Responses 1'!", "").split(":")[0];
            let firstNameCell = (sheet.getCellByA1("B" + row.match(/\d+/)[0])).value;
            let lastNameCell = (sheet.getCellByA1("C" + row.match(/\d+/)[0])).value;
            if (FirstName.toLowerCase() == firstNameCell.toLowerCase() || LastName.toLowerCase() == lastNameCell.toLowerCase()) {
                return { FirstName: (FirstName.toLowerCase() == firstNameCell.toLowerCase()), LastName: (LastName.toLowerCase() == lastNameCell.toLowerCase()) };
                break;
            }
        }
        return { FirstName: false, LastName: false };
    });
}
function create(interaction, bot, isVerified, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isVerified) {
            let verifiedRole = interaction.guild.roles.cache.get("1079576809168965714"); // Update Ping
            let member = interaction.member;
            let embed = new discord_js_1.EmbedBuilder()
                .setTitle(`Success!`)
                .setColor("#00ff0a");
            member.roles.add(verifiedRole);
            if (member.moderatable) {
                yield member.setNickname(`${options.FirstName} ${options.LastName}`);
            }
            yield interaction.reply({ content: `Welcome **${options.FirstName}**!, You have been verified! ✅`, embeds: [embed] });
        }
        else {
            let first_name, last_name;
            if (options.FirstName)
                first_name = "✅";
            else
                first_name = "❌";
            if (options.LastName)
                last_name = "✅";
            else
                last_name = "❌";
            let user = yield bot.users.cache.get(interaction.member.user.id);
            let embed = new discord_js_1.EmbedBuilder()
                .setTitle(`Error`)
                .setColor("#ff0000")
                .setDescription(`Your credentials are wrong:
            
            ${bold("First Name")}:${first_name}
            ${bold("Last Name")}:${last_name}
            
            ${bold("*Further issues please DM any mentors!*")}
            `)
                .setTimestamp();
            user.send({ embeds: [embed] });
            yield interaction.reply({ content: "❌|  Please check your DMs.", ephemeral: true });
        }
    });
}
module.exports = {
    name: commandName,
    command: cmd.toJSON(),
    execute: function (interaction, bot, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            let first_name = interaction.options.data[0].value;
            let last_name = interaction.options.data[1].value;
            Verify(doc, first_name, last_name).then((value) => __awaiter(this, void 0, void 0, function* () {
                if (value.FirstName && value.LastName) {
                    yield create(interaction, bot, true, { FirstName: first_name, LastName: last_name });
                }
                else {
                    yield create(interaction, bot, false, value);
                }
            }));
        });
    },
};
