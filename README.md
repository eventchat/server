EventChat Server
================

[![Build Status](https://travis-ci.org/eventchat/server.svg?branch=master)](https://travis-ci.org/eventchat/server)

This repository contains the source code for the EventChat App.



Dependencies
------------

Before installing the server, make sure that you have the following
softwares installed.

* Node.js
* MongoDB


Installation
------------

Install node.js modules:

```bash
make dep
```

Run the server: (Note that you have to set the environment variables when running the server)

```bash
EVENTCHAT_DB_URL="mongodb://localhost/eventchat" EVENTCHAT_SECRET="random string" make server
```

Run test

```bash
make test
```

