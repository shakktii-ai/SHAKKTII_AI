import mongoose from 'mongoose';

console.log('Loading MongoDB configuration...');
const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI:', MONGODB_URI ? '*** URI is set (hidden for security) ***' : 'MONGODB_URI is not set');

if (!MONGODB_URI) {
  const errorMsg = 'Please define the MONGODB_URI environment variable inside .env.local';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log('dbConnect called, checking for cached connection...');
  
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }
  
  console.log('No cached connection, creating new connection...');

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
