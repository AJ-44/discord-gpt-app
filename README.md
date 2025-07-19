//javascript gpt app for discord
(some knowledge of nodejs & cloud/selfhosted servers will be helpful.) 
Before you can use your gpt app you will need to set up a few things:

1-create a discord server so you have a private space to use your app 
and create an app with the necessary rights and guild access so that 
it can read and create messages on your server. Ensure your app is added
to any text channel you wish to use it in with the correct permissions.
see:
https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server
https://discord.com/developers/docs/quick-start/getting-started
https://www.ionos.co.uk/digitalguide/server/know-how/creating-discord-bot/

2-create an account on open ai and generate your api keys and permissions
to allow the right models on the open ai dashboard. Models set to use
on this bot are gpt4o-mini and dalle3. you will also need credit on the account.
see: https://platform.openai.com/api-keys

 ------------------------------
tokens, ids & api keys:
Once you have the app added to your server and setup an api with a key then you
can add your client id, guild id, discord app token number and openai api key to your .env file.
This is a text file that stores environment variables and
configuration settings seperately and keeps it private. This stops it 
from being hardcoded in the source code and maintains security.

discord commands:
The commands folder contains the js files for use with the discord 
/command function. Any new command files can be added here. 
premade commands are /imagine for image creation in dalle3. 

npm dependencies:
Whether you are running the app locally or on a cloud server for 
persistance, you will need to have the dependent packages installed 
in the same folder as your bot.js using npm install (node.js,openai,discord.js). 
Start the bot.js file with the command: node bot.js and 
it will then be shown as online on discord.

persistance: 
To enable persistance and run the app at all times (providing it is being run 
from a cloud server) then you will need to use a package such as pm2 or
 forever as a daemon to stop it dropping out.
see: https://pm2.keymetrics.io/docs/usage/quick-start/ 

gpt memory:  
The gpt has a default 40 message memory which can be changed by the user 
but will slow down responses with a longer preset memory.
use the command !clearhistory to reset message memory.

Common issues when setting up are incorrect permissions on the discord 
app that stops it having guild or read/write privileges in the text channel 
or changes that are made in app setup that requires a new token to be generated.
 Make a new app or regenerate the token if there are issues. Always include
new generated tokens in the .env file. 





