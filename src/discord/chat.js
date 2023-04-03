const sliceChat = (message) => {
  //Check if the message is more than 1900 characters
  if (message.length > 1900) {
    //Slice the message into 1900 character chunks
    const messageChunks = message.match(/.{1,1900}/g);

    //Return the result as an array of messages
    return messageChunks;
  }

  return message;
};

module.exports = { sliceChat };
