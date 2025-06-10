
//run packages & files
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const OpenAI = require('openai');

// ids api keys and token links
const openai = new OpenAI({ apiKey: process.env.openai_api_key });
const token = process.env.token;
const clientid = process.env.clientid;
const guildid = process.env.guildid;

// discord setup 
const Discord = require('discord.js');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
    intents:
        [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
        ],
});
//--------------------------------------------
// discord code to enable use of /commands stored in commands directory
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
//--------------------------------------------
// initiate message history & state gpt memory length in msgs
const messageHistory = {};
const maxHistoryLength = 40

// nlp to summarise & trim messages
const natural = require('natural');
const sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
async function summarizeText(text) {
    return text.trim();
  }

// message creation
client.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    console.log('messageCreate event triggered');
const userid = msg.author.id;

//get or initialize message history for the user id
if (!messageHistory[userid]) {
messageHistory[userid] = { messages: [] };
} else {
messageHistory[userid].messages = messageHistory[userid].messages || [];
}

//add the user's message to their history
messageHistory[userid].messages.push({ role: 'user', content: msg.content });

 // Check for clear history command !clearhistory to reset gpt memory
 if (msg.content === '!clearhistory') {
    messageHistory[userid].messages = []; // Wipe the user's message history
    return msg.channel.send('Your message history has been cleared.');
}

 // Limit message history to the stated memory length 
 if (messageHistory[userid].messages.length > maxHistoryLength) {
    messageHistory[userid].messages.shift(); // Remove the oldest message
 }

//structure messages for openai
const messages = [
{
role: 'system',
content: 'you are a helpful assistant that provides short, clear, factual and concise answers, you always remove spaces between listed items. you always keep responses summarised with no space padding.',
},
...messageHistory[userid].messages,
];

try {
const completion = await openai.chat.completions.create({
model: 'gpt-4o-mini',
messages: messages,
temperature: 0.4, //variable parameter settings for gpt 
top_p: 0.2,
frequency_penalty: 0.3,
presence_penalty: 0.2,
});

let botreply = completion.choices[0].message.content;

 // trim the reply with the nlp
 botreply = await summarizeText(botreply);

 // sendmessage to user
 const maxLength = 2000; //max gpt message length & chunking enabled
 let current = 0;
 while (current < botreply.length) {
 const chunk = botreply.substring(current, current + maxLength);
 await msg.channel.send(chunk);
 current += maxLength;
 }
 
//add the bot's reply to the history to store in its memory
messageHistory[userid].messages.push({ role: 'assistant', content: botreply });
} catch (error) {
console.error('openai error:', error);
}
});
//-------------------------------------------
// reference for discord commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`no command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'there was an error while executing this command', ephemeral: true });
        } else {
            await interaction.reply({ content: 'there was an error while executing this command', ephemeral: true });
        }
    }
});

// when the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
    console.log(`ready logged in as ${c.user.tag}`);

    // register commands
    registercommands();
});

// commands deployment function
async function registercommands() {
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9');
    const commands = [];

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            console.log('started refreshing application (/) commands');

            await rest.put(
                Routes.applicationGuildCommands(clientid, guildid),
                { body: commands },
            );

            console.log('successfully reloaded application (/) commands');
        } catch (error) {
            console.error(error);
        }
    })();
}

client.login(token);
