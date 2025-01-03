import mongoose from "mongoose";
import { type } from "os";

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













// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
// 	username: {
// 		type: String,
// 		required: true,
// 		unique: true,
// 	},
// 	password: {
// 		type: String,
// 		required: true,
// 	},
// 	favorites: {
// 		type: Array,
// 		default: [],
// 	},
// 	playlists: {
// 		type: Array,
// 		default: [],
// 	},
// });

// const User = mongoose.model("User", UserSchema);
// export default User;
