import redis from 'redis';

const redisClient = redis.createClient({
    connectTimeout: 10000,
    socket: {
        path: process.env.REDIS_PATH,
        reconnectStrategy: function(retries) {
            if (retries > 20) {
                console.log("Too many attempts to reconnect. Redis connection was terminated");
                return new Error("Too many retries.");
            } else {
                return retries * 500;
            }
        }
    }
})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

// const redisClient = redis.createClient({
//     url: process.env.REDIS_URL,
// })
//     .on('error', err => console.log('Redis Client Error', err))
//     .connect();

const scanAll = async (pattern = '*', count = 100) => {
    const results = {};
    const iteratorParams = {
        TYPE: 'string',
        MATCH: pattern + ':*',
        COUNT: count
    }
    for await (const key of (await redisClient).scanIterator(iteratorParams)) {
        const val = await (await redisClient).get(key);
        const data = key.split(':');
        results[data[0]] = val;

    }
    return results;
};
export default scanAll;