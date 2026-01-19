// import mongoose from 'mongoose';

// const dbConnect = async () => {
//   if (mongoose.connection.readyState >= 1) return;

//   return mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// };

// export default dbConnect;


// import mongoose from "mongoose";


// const connectDb = handler =>async(req,res)=>{
//     if(mongoose.connections[0].readyState){
//         return handler(req, res)
//     }
//     await mongoose.connect(process.env.MONGODB_URI)
//     return handler(req,res);
// }

// export default connectDb; 

// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error(
//     'Please define the MONGODB_URI environment variable'
//   );
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     }).catch(error => {
//       console.error('MongoDB connection error:', error);
//       throw error;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
// }

// export default dbConnect;



import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = (handler) => async (req, res) => {
  if (!cached.conn) {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      }).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
  }

  return handler(req, res);
};

export default connectDb;
