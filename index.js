import "dotenv/config"
import { Client, REST, Routes,Events, Collection, GatewayIntentBits } from "discord.js"
import * as queue from "./commands/queue.js"
import { readFileSync, readdirSync } from 'node:fs'


const commands = []

const COMMANDS_DIR = "./commands/"
const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID



const client = new Client({intents: [GatewayIntentBits.Guilds]})
const rest = new REST({version: '10'}).setToken(TOKEN)


client.commands = new Collection()


for await (let file of readdirSync(COMMANDS_DIR)) {
  const file_path = COMMANDS_DIR + file

  const command = await import(file_path)
 
  
  commands.push({name: command.default.data.name, description: command.default.data.description})
  
  client.commands.set(command.default.data.name, command.default)
}




client.once(Events.ClientReady, async c => {
  console.log("Ready")

  await rest.put(Routes.applicationCommands(CLIENT_ID), {body: commands})

})

client.on(Events.InteractionCreate, async interaction => {
   
   
  if(!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if(!command) console.error("This command does not exist")
  await command.execute(interaction)
})



client.login(TOKEN)
