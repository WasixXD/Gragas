import { SlashCommandBuilder, EmbedBuilder  } from "discord.js"




class Lobby {
  constructor() {
    this.isFull = false
    this.TOP = {name: "TOP", player: true}
    this.JUNGLE = {name: "JUNGLE", player: true}
    this.MID = {name: "MID", player: null} 
    this.BOT = {name:"BOT", player: true} 
    this.SUPPORT = {name: "SUPPORT", player: true}
  }

  *iterator() {

    let roles = [this.TOP, this.JUNGLE, this.MID, this.BOT, this.SUPPORT]
    for(let role of roles) {
      yield role 
    }

  }


  [Symbol.iterator]() {
   
    return this.iterator()

  } 

  

  find_best_player(list_of_players, position, side){
    for( let player of list_of_players ) {
      if(player.hasOwnProperty(position)) {
        if(!side[position].player) {
          side[position].player = player
          list_of_players.shift()
          
          
        } else {
          side.isFull = true
        } 
      } 
      
    }
  }
  
}





class QueueManager {
  constructor() {
    this.lobbys = new Map()
    this.gamesWaiting = []
    this.queue = []
    this.queuePlayers = 0
  }


  matchmaking() {
    let game;
    for( let id of this.gamesWaiting ) {
      
      game = this.lobbys.get(id)

      // redundante(?)
      if(!game.BLUE_SIDE.isFull && !game.RED_SIDE.isFull) {
        for( let role of game.BLUE_SIDE ) {
          game.BLUE_SIDE.find_best_player(this.queue, role.name, game.BLUE_SIDE)
        }

        for( let role of game.RED_SIDE ) {
          game.RED_SIDE.find_best_player(this.queue, role.name, game.RED_SIDE)
        }
        console.log("BLUE => ", game.BLUE_SIDE, "\nRED => ", game.RED_SIDE)

        return false
      } else {
        return true
      }

    }

  }


  side(id) {
    let blueSide = this.lobbys.get(id).BLUE_SIDE
    let redSide = this.lobbys.get(id).RED_SIDE
    let positions = {RED_SIDE: [], BLUE_SIDE: []}
    for ( const key in blueSide ) {
      if( key != "isFull" ) {
        positions.BLUE_SIDE.push(`${key}: ${blueSide[key].player.name}\n`)
        positions.RED_SIDE.push(`${key}: ${redSide[key].player.name}\n`)

      }
    }

    return positions
  }



  createLobby(id) {
    this.lobbys.set(id, {READY: false, BLUE_SIDE: new Lobby(), RED_SIDE: new Lobby()}) 
    this.gamesWaiting.push(id)

  }

  addPlayerToQueue(player) {
    this.queuePlayers++
    this.queue.push(player)
  }

  needMoreLobby() {
    if((this.gamesWaiting.length * 10) / this.queue.length < 1 ) {
      this.createLobby(Math.random())
    }
  }
}



const queue = new QueueManager()
queue.createLobby("ABC")

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Adiciona você a fila"),

    async execute(interaction) {
      const userRoles = await interaction.member.roles.cache
      const { user } = await interaction.member
      const player = {name: user.globalName}
      const tmpEmbedValues = []

      queue.addPlayerToQueue(player)
     
      for(let [key, value] of userRoles) {
        if(value.name != "@everyone") {
          player[value.name.toUpperCase()] = true
          tmpEmbedValues.push(value.name.toUpperCase())
          
        }
      }
 


      
      const queueEmbed = new EmbedBuilder()
        .setColor(0xA1662F)
        .setTitle("Se é você que vai pagar eu tô dentro")
        .setAuthor({name: "Gragas bot", })
        .setDescription("Arranjando um espacinho pra você na queue...")
        .addFields({name: "Pessoas na queue", value: `${queue.queuePlayers}`, inline: true}) 
        .addFields({name: "Suas posições", value: tmpEmbedValues.toString()})
        .setTimestamp()
        .setFooter({text: "Made with love by @WasixXD", iconURL: "https://avatars.githubusercontent.com/u/66091116?v=4"})
     
    
    await interaction.reply({embeds: [queueEmbed]})
    
    if(queue.gamesWaiting.length != 0) {
      let interval = setInterval(async () => {
          let gameIsReady = queue.matchmaking()
          
          if(gameIsReady) {
            queue.needMoreLobby()
            console.log(queue)
            
            clearInterval(interval)
            let id = "ABC"
            
            let lobbyEmbed = new EmbedBuilder()
              .setColor(0x008000)
              .setTitle("Lobby criado")
              .setAuthor({name: "Gragas bot"})
              .setDescription("Conseguir completar dois times!")
              .addFields({name: "BLUE SIDE", value: `${queue.side(id).BLUE_SIDE.join("")}`})
              .addFields({name: "RED SIDE", value: `${queue.side(id).RED_SIDE.join("")}`})
              
            
            await interaction.followUp({embeds: [lobbyEmbed], ephemeral: true})
          }

        }, 10)
    }
    

  }
}
