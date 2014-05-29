var env = process.env;

console.log(env.EVENTCHAT_DB_URL);

module.exports = {
  DB_URL: env.MONGOHQ_URL || env.EVENTCHAT_DB_URL,
  SECRET: env.EVENTCHAT_SECRET
};
