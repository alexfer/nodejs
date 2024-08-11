import redis from 'redis';

const client = redis.createClient({socket: {
        path: process.env.REDIS_PATH
    }
});

const scan = async (match = '*') => {
    await client.connect();

    const keys = await client.sendCommand(["keys", match + ':*']);
    const buffer = {};

    for (const [key, value] of Object.entries(keys)) {
        const val = await client.get(value);
        const data = value.split(':');
        buffer[data[0]] = val;
    }

    await client.quit();
    return buffer;
};

export default scan;