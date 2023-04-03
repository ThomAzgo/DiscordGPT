const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");

//Initialize database
let db = new sqlite3.Database(
  path.join(__dirname, "../database/chatgpt-data.db"),
  (err) => {
    if (err) {
      return console.error(err.message); //Err initialising database
    }
    console.log("Connected to the chatgpt-data database."); //Connected to database
  }
);

const initializeTables = () => {
  return db.run(
    `CREATE TABLE IF NOT EXISTS conversations (id, channel_id, user, prompt, attitude, conversation_log, PRIMARY KEY (id))`
  );
};

const insertConversation = async (
  id,
  channel_id,
  user,
  prompt,
  attitude,
  conversation_log
) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO conversations (id, channel_id, user, prompt, attitude, conversation_log) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        channel_id,
        user,
        prompt,
        attitude,
        JSON.stringify(conversation_log),
      ],
      (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      }
    );
  });
};

const getConversation = async (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM conversations WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
};

const updateConversation = async (id, conversation_log) => {
  //Get the conversation log from the database
  let conversation = await getConversation(id);
  let conversation_log_from_db = conversation.conversation_log;

  conversation_log_from_db = JSON.parse(conversation_log_from_db);

  //Add the new message to the conversation log
  conversation_log_from_db.push(conversation_log);

  conversation_log_from_db = JSON.stringify(conversation_log_from_db);

  //Update the conversation log in the database
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE conversations SET conversation_log = ? WHERE id = ?`,
      [conversation_log_from_db, id],
      (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      }
    );
  });
};

const closeDatabase = () => {
  return db.close((err) => {
    if (err) {
      return console.error(err.message); //Err closing database
    }
    console.log("Close the database connection."); //Closed database
  });
};

const checkIdExists = async (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM conversations WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

initializeTables();

module.exports = {
  initializeTables,
  insertConversation,
  updateConversation,
  getConversation,
  checkIdExists,
};
