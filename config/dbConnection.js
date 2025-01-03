import { mongoose } from 'mongoose'

export const connectDB = async () => {
    try {
		const connect = await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
		console.log("db connected", connect.connection.name);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}