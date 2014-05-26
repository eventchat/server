TEST_TIMEOUT = 5000
TEST_REPORTER = spec

dep:
	@npm install -d .

server:
	@node server.js

test:
	@NODE_ENV=test \
		./node_modules/.bin/mocha \
			--require should \
			--timeout $(TEST_TIMEOUT) \
			--reporter $(TEST_REPORTER) \
			--recursive \
			--check-leaks \
			--bail \
			test

.PHONY: dep server test
