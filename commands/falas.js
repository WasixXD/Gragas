import { SlashCommandBuilder } from "discord.js"



export default {
  data: new SlashCommandBuilder()
    .setName("falas")
    .setDescription("Diz uma frase iconica"),

    async execute(interaction) {
      await interaction.reply("Fala")

  }
}
