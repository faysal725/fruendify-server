const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/db');
const {Server} = require('socket.io');
const rootSocket = require('./rootSocket');

console.log('Hello Node-Express-Mysql with Sequelize Boilerplate!!');
connectDB();
require('./cronJobs');
// eslint-disable-next-line import/order
const http = require('http');
// socket initialization
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    path: '/api/local/v1/socket.io',
});
globalThis.io = io;
rootSocket(io)

server.listen(config.port, () => {
    console.log('SERVER');
    console.log(`Listening to port ${config.port}`);
});
