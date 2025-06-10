const { SlashCommandBuilder } = require('discord.js')
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.openai_api_key })

module.exports = {
data: new SlashCommandBuilder()
.setName('imagine')
.setDescription('creates an image from a text prompt')
.addStringOption(option =>
option.setName('prompt').setDescription('the text prompt for the image').setRequired(true)
),
async execute(interaction) {
await interaction.deferReply()
const prompt = interaction.options.getString('prompt')
try {
const response = await openai.images.generate({
model:'dall-e-3',
prompt: prompt,
n: 1,
size: '1024x1024',
response_format: 'b64_json', // request base64 encoded data
})
const image_data = response.data[0].b64_json
const image_buffer = Buffer.from(image_data, 'base64')

await interaction.editReply({
files: [{
attachment: image_buffer,
name: 'imagine.png'
}]
})
} catch (error) {
console.error('openai error', error)
await interaction.editReply('error generating image. please try again.')
}
},
}