import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

console.log('MongoDB URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Log URI with hidden password

mongoose.set('strictQuery', false);

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log('Initializing new MongoDB connection...');
        try {
            cached.promise = mongoose.connect(MONGODB_URI, opts);
            console.log('MongoDB connection initialized successfully');
        } catch (e) {
            console.error('Error initializing MongoDB connection:', {
                name: e.name,
                message: e.message,
                stack: e.stack
            });
            throw e;
        }
    }

    try {
        console.log('Waiting for MongoDB connection...');
        cached.conn = await cached.promise;
        console.log('MongoDB connection established successfully');
    } catch (e) {
        cached.promise = null;
        console.error('Error establishing MongoDB connection:', {
            name: e.name,
            message: e.message,
            stack: e.stack
        });
        throw e;
    }

    return cached.conn;
}

export default connectDB;
