import {
    ActivityType,
    CacheType,
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    Embed, EmbedBuilder, GuildMember, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, CacheTypeReducer
} from "discord.js";

const commandName = "verify"

const cmd = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Verification if you are a benzene bots team member')
    .addStringOption(option =>
        option.setName('first_name')
            .setDescription('Your first name that you registered to the team')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('last_name')
            .setDescription('Your last name that you registered to the team')
            .setRequired(true)
    )

function bold(str: string) {
    return `**${str}**`
}

async function Verify (doc,FirstName, LastName) {
    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows();

    await sheet.loadCells()

    for (let i = 0; i < rows.length; i++) {
        let value = rows[i]
        let row = value.a1Range.toString().replace("'Form Responses 1'!","").split(":")[0]
        let firstNameCell = (sheet.getCellByA1("B"+row.match(/\d+/)[0])).value
        let lastNameCell = (sheet.getCellByA1("C"+row.match(/\d+/)[0])).value

        if (FirstName.toLowerCase() == firstNameCell.toLowerCase() || LastName.toLowerCase() == lastNameCell.toLowerCase()) {
            return {FirstName: (FirstName.toLowerCase() == firstNameCell.toLowerCase()), LastName: ( LastName.toLowerCase() == lastNameCell.toLowerCase())}
            break
        }
    }

    return {FirstName: false, LastName: false}
}


async function create(interaction: ChatInputCommandInteraction<CacheType>, bot, isVerified, options?){
    if (isVerified) {
        let verifiedRole = interaction.guild.roles.cache.get("1079576809168965714") // Update Ping
        let member: CacheTypeReducer<CacheType, any> = interaction.member

        let embed = new EmbedBuilder()
            .setTitle(`Success!`)
            .setColor("#00ff0a")

        member.roles.add(verifiedRole)

        if (member.moderatable) {
            await member.setNickname(`${options.FirstName} ${options.LastName}`)
        }

        await interaction.reply({content: `Welcome **${options.FirstName}**!, You have been verified! ✅`, embeds: [embed]})
    }
    else {
        let first_name, last_name

        if (options.FirstName) first_name = "✅"
        else first_name = "❌"

        if (options.LastName) last_name = "✅"
        else last_name = "❌"

        let user = await bot.users.cache.get(interaction.member.user.id)

        let embed = new EmbedBuilder()
            .setTitle(`Error`)
            .setColor("#ff0000")
            .setDescription(`Your credentials are wrong:
            
            ${bold("First Name")}:${first_name}
            ${bold("Last Name")}:${last_name}
            
            ${bold("*Further issues please DM any mentors!*")}
            `)
            .setTimestamp()

        user.send({embeds: [embed]})
        await interaction.reply({content: "❌|  Please check your DMs.", ephemeral: true})
    }
}

module.exports = {
    name: commandName,
    command: cmd.toJSON(),
    execute: async function (interaction: ChatInputCommandInteraction<CacheType>, bot: Client, doc) {
        let first_name = interaction.options.data[0].value
        let last_name = interaction.options.data[1].value
        Verify(doc, first_name, last_name).then(async (value) => {
            if (value.FirstName && value.LastName) {
                await create(interaction,  bot,true, {FirstName: first_name, LastName: last_name})
            } else {
                await create(interaction, bot,false, value)
            }
        })
    },
}