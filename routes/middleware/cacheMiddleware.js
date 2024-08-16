const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 86400 }); // cache

function cacheMiddleware(req, res, next) {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        console.log(`Cache hit for ${key}`);
        res.send(cachedResponse);
    } else {
        console.log(`Cache miss for ${key}`);
        res.originalSend = res.send;
        res.send = (body) => {
            res.originalSend(body);
            cache.set(key, body);
        };
        next();
    }
}

module.exports = cacheMiddleware;
