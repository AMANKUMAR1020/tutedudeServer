import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	hobbies:[{
		type: String,
	}],
	friends: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	}],
	friendsRequest:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	}]
});

const User = mongoose.model("User", UserSchema);
export default User;