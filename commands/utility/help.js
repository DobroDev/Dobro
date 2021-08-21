// This file is part of Dobro
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
const { MessageEmbed } = require('discord.js');
const { readdirSync } = require("fs");
const config = require("../../configuration/conf.json").bot;
const prefix = config.prefix;

module.exports = {
  name: "help",
  usage: "help",
  aliases: ["h"],
  description: "Displays the list of commands",
  permsneeded: "SEND_MESSAGES",
  run: async (bot, message, args) => {
    try {
      const roleColor =
        message.guild.me.displayHexColor === "#000000"
          ? "#ffffff"
          : message.guild.me.displayHexColor;

      if (!args[0]) {
        let categories = [];

        const ignoredCategories = ["welcome-channel", "admin", "goodbye-channel"]

        const dirEmojis = {
          information: "🛈 ",
          moderation: "🔨 ",
          utility: "🛠️ ",
          fun: "🤪 ",
          owner: "👑 ",
        };

        readdirSync("./commands/").forEach((dir) => {
          if (ignoredCategories.includes(dir)) return;
          const editedname = `${dirEmojis[dir]} ${dir.toUpperCase()}`;
          const commands = readdirSync(`./commands/${dir}/`).filter((file) =>
            file.endsWith(".js")
          );

          const cmds = commands.filter((command) => {
            let file = require(`../../commands/${dir}/${command}`);

            return !file.hidden;
          }).map((command) => {
            let file = require(`../../commands/${dir}/${command}`);

            if (!file.name) return "No command name.";

            let name = file.name.replace(".js", "");

            return `\`${name}\``;
          });

          let data = new Object();

          data = {
            name: editedname,
            value: cmds.length === 0 ? "In progress." : cmds.join(" "),
          };

          categories.push(data);
        });

        const embed = new MessageEmbed()
          .setTitle("Dobro | Command List", config.logo)
          .addFields(categories)
          .setDescription(
            `Use \`${prefix}help\` followed by a command name to get more additional information on a command. For example: \`${prefix}help meme\`.`
          )
          .setFooter(
            `Requested by ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setTimestamp()
          .setColor('BLUE');
        return message.channel.send(embed);
      } else {
        const command =
          bot.commands.get(args[0].toLowerCase()) ||
          bot.commands.find(
            (c) => c.aliases && c.aliases.includes(args[0].toLowerCase())
          );

        if (!command) {
          const embed = new MessageEmbed()
            .setTitle(`Unknown command! Use \`${prefix}help\` for all of my commands!`)
            .setColor("FF0000");
          return message.channel.send(embed);
        }

        const embed = new MessageEmbed()
          .setTitle("Command Details:")
          .addField("Prefix:", `\`${prefix}\``)
          .addField(
            "Command Name:",
            command.name ? `\`${command.name}\`` : "No name for this command."
          )
          .addField(
            "Description:",
            command.description
              ? `\`${command.description}\``
              : "No description for this command."
          )
          .addField(
            "Usage:",
            command.usage
              ? `\`${prefix}${command.usage}\``
              : `\`${prefix}${command.usage}\``
          )
          .addField(
            "Alisases:",
            command.aliases
              ? `\`${command.aliases.join("` `")}\``
              : "No aliases for this command."
          )
          .addField(
            "Cooldown",
            command.cooldown
              ? `\`${command.cooldown}\``
              : "No Cooldown for this command."
          )
          .addField(
            "Permissions Needed",
            command.permsneeded
              ? `\`${command.permsneeded}\``
              : "No Permissions needed for this command."
          )

          .setFooter(`Usage Syntax: <> = required; [] = optional`, config.logo)
          .setColor(roleColor);
        return message.channel.send(embed);
      }
    } catch (err) {
      console.log(err)
    }
  },
};