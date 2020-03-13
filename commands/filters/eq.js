const premium = require('../../utils/premium.js');
const Discord = require('discord.js');
const emojis = require('../../recourses/emojis.json');
const colors = require('../../recourses/colors.json');

module.exports = {
    name: "eq",
    description: "Sets the equalizer of the current playing song.",
    async execute(client, message, args) {
        if(!premium(message.author.id, "Supporter")) return message.channel.send(`This command is only available to **Premium** users. Click here to get premium: https://www.patreon.com/join/eartensifier`)

        const voiceChannel = message.member.voice.channel;
        const player = client.music.players.get(message.guild.id);

        if(!voiceChannel) return client.responses('noVoiceChannel', message);
        if(voiceChannel.id != message.guild.members.cache.get(client.user.id).voice.channel.id) return client.responses('sameVoiceChannel', message);

        if(!player) return client.responses('noSongsPlaying', message)

        if(!args[0]){
            const embed = new Discord.MessageEmbed()
            .setAuthor('Custom Equalizer')
            .setColor(client.colors.main)
            .setDescription('There are 14 bands that can be set from -10 to 10. Not all bands must be filled out.')
            .addField('Example Usage', `${client.settings.prefix} equalizer 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n${client.settings.prefix} equalizer 2 3 0 8 0 5 0 -5 0 0`)
            .addField('Reset Equalizer', `You can reset the equalizer by doing:\n${client.settings.prefix} equalizer reset`)
            .addField('Help', `If you need more help, please join the [support server](${client.settings.server})`)
            .setFooter('Premium Command')
            return message.channel.send(embed);
        } else if(args[0] == "off" || args[0] == "reset"){
            player.setEQ(Array(13).fill(0).map((n, i) => ({ band: i, gain: 0 })));
        }

        let bands = args.join(" ").split(/[ ]+/);
        let bandsStr = "";
        for(let i = 0; i < bands.length; i++){
            if(i > 13) break;
            if(isNaN(bands[i])) return message.channel.send(`Band #${i+1} is not a valid number. Please type \`ear eq\` for info on the equalizer command.`)
            if(bands[i] > 10) return message.channel.send(`Band #${i+1} must be less than 10. Please type \`ear eq\` for info on the equalizer command.`)
        }

        for(let i = 0; i < bands.length; i++){
            if(i > 13) break;
            player.setEQ([{ band: i, gain: bands[i/10] }, ]);
            bandsStr += `${bands[i]} `
        }

        const delay = ms => new Promise(res => setTimeout(res, ms));
        let msg = await message.channel.send(`${emojis.loading} Setting equalizer to \`${bandsStr}\`. This may take a few seconds...`)
        const embed = new Discord.MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setDescription(`Equalizer set to: \`${bandsStr}\``)
        .setFooter(`To reset the equalizer type: ear eq reset`)
        .setColor(colors.main);
        await delay(5000);
        return msg.edit("", embed);
    }
}