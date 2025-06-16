const { sendMessage } = require('./sendMessage');
const getChat = require('./getChat');
const markMessageRead = require('./markMessageRead');
const deleteMessage = require('./deleteMessage');

module.exports = {
  sendMessage,
  getChat,
  markMessageRead,
  deleteMessage,
};
