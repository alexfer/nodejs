import redis from 'redis';

const redisClient = redis.createClient({
    socket: {
        path: process.env.REDIS_PATH
    }
})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

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