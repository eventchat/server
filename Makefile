TEST_TIMEOUT = 5000
TEST_REPORTER = spec
TEST_SLOW_THRESHOLD = 500

dep:
	@npm install -d .

server:
	@node server.js

test:
	@NODE_ENV=test \
	EVENTCHAT_DB_URL="mongodb://localhost/eventchat-test" \
	EVENTCHAT_REDIS_URL="redis://localhost:6379" \
	EVENTCHAT_SECRET="i'm secret" \
		./node_modules/.bin/mocha \
			--require should \
			--timeout $(TEST_TIMEOUT) \
			--reporter $(TEST_REPORTER) \
			--slow $(TEST_SLOW_THRESHOLD) \
			--recursive \
			--check-leaks \
			--bail \
			test

.PHONY: dep server test
