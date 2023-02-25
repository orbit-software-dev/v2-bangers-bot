require('dotenv').config();
const { APPLICATION_ID, GUILD_ID, BOT_TOKEN } = process.env;

const { REST, Routes } = require('discord.js');
const fs = require('fs');

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
const COMMANDS_DIR = `./src/commands`;

const commands = [];

for (const file of fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith('.js'))) {
	const command = require(`${COMMANDS_DIR}/${file}`);
	commands.push(command.data.toJSON());
}

(async () => {
	try {
		console.log(`Refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
			{ body: commands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();