var env = process.env;

module.exports = {
  DB_URL: env.EVENTCHAT_DB_URL,
  REDIS_HOST: env.EVENTCHAT_REDIS_HOST,
  REDIS_PORT: env.EVENTCHAT_REDIS_PORT,
  SECRET: env.EVENTCHAT_SECRET
};
