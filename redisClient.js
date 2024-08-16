const redis = require("redis");
const util = require("util");

// สร้าง Redis client
const client = redis.createClient({
    host: 'localhost', // หรือ IP ของ Redis server
    port: 6379,
});

// เพื่อทำให้ redis รองรับ async/await
client.get = util.promisify(client.get);

client.on("error", function (error) {
    console.error(error);
});

module.exports = client;