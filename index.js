const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const app = express();

// Express server to keep Replit alive
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(3000, () => {
  console.log('Server is up and running!');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.User, Partials.GuildMember]
});

const TOKEN = 'MTI0NjgxNDM5MjgyNjMzMTE2Ng.GyE8PC.L6A70e1RP9cz6BdloeThfpUPDnJyTorAw2UISU';
const ADMIN_USER_ID = '1001108686741192744';
const MONITORED_USER_ID = '1272242818500395022';

let lastStatus = null;
let lastUsername = null;
let lastAvatar = null;

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const monitoredUser = await client.users.fetch(MONITORED_USER_ID);

  if (monitoredUser) {
    sendUserInfoToAdmin(monitoredUser);
  }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (newPresence.userId === MONITORED_USER_ID) {
    const newStatus = newPresence?.status || 'offline';
    
    if (newStatus !== lastStatus) {
      lastStatus = newStatus;
      sendStatusChangeToAdmin(newStatus);
    }
  }
});

client.on('userUpdate', (oldUser, newUser) => {
  if (newUser.id === MONITORED_USER_ID) {
    if (oldUser.username !== newUser.username || oldUser.avatar !== newUser.avatar) {
      sendUserInfoToAdmin(newUser);
    }
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.id === MONITORED_USER_ID) {
    const channel = newState.channel;
    
    if (channel) {
      sendVoiceChannelUpdateToAdmin(channel);
    }
  }
});

async function sendUserInfoToAdmin(user) {
  const admin = await client.users.fetch(ADMIN_USER_ID);
  if (admin) {
    const username = user.username;
    const avatarURL = user.displayAvatarURL();
    const message = `**User Info Updated:**
    - **Username**: ${username}
    - **Avatar**: ${avatarURL}`;

    admin.send(message);
  }
}

async function sendStatusChangeToAdmin(status) {
  const admin = await client.users.fetch(ADMIN_USER_ID);
  if (admin) {
    admin.send(`The user's status changed to: ${status}`);
  }
}

async function sendVoiceChannelUpdateToAdmin(channel) {
  const admin = await client.users.fetch(ADMIN_USER_ID);
  if (admin) {
    admin.send(`The user has joined the voice channel: ${channel.name} (${channel.id})`);
  }
}

client.login(TOKEN);
