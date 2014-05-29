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

Copy `config.json.example` to `config.json` and modify accordingly

```bash
cp config.json.example config.json
```
    

Install node.js modules:

```bash
make dep
```

Run server

```bash
make server
```

Run test

```bash
make test
```

