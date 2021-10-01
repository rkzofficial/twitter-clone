# twitter-clone

## Description

A full-stack Twitter clone app built using Node.js, Express.js, React.js, and MongoDB.

https://twitter-clone.kira.yt/

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have a running MongoDB instance.

### Configuration

Copy the `server/.env.example` file to `server/.env` and update the values if your configuration is different than the default.

### Installing

Install server dependencies

```bash
$ cd server
$ npm install
```

Install client dependencies

```bash
$ cd client
$ npm install
```

### Start the server in development mode

```bash
$ cd server
$ npm run dev
```

If everything was successful, you should see the messages being displayed in the terminal, telling that the server has successfully connected to a MongoDB and runs on a given port.

### Start the client

```bash
$ cd client
$ npm start
```

Now, the app should be running on `http://localhost:3000`.

## Running the tests

### Server

To test API routes

```bash
# run all tests
$ npm test

# or

# run all tests in watch mode
$ npm run test:watch
```

### Client

To run tests with Cypress first, copy the `client/.env` file to a `client/.env.local`. There is a default password for test users. You do not need to change that. Then simply run:

```bash
$ npm run cypress:open
```
