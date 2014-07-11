var env = process.env;

module.exports = {
  DB_URL: env.EVENTCHAT_DB_URL,
  REDIS_URL: env.EVENTCHAT_REDIS_URL,
  SECRET: env.EVENTCHAT_SECRET
};
