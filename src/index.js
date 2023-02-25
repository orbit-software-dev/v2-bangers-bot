require('ffmpeg-static');
require('dotenv').config();
const { BOT_TOKEN } = process.env;

require('./bot').getInstance().setup(BOT_TOKEN);
