import User from "../models/User.js";

//@desc Get all users
//@route GET /api/users/allusers
//@access public
const getAllUser = async (req, res) => {
	const users = await User.find({});
  
	if (!users) {
	  return res.status(400).json({ message: "No user found" });
	}
  
	const filterUsers = users.map((user) => ({
	  id: user._id,
	  username: user.username,
	  hobbies: user.hobbies,
	  friends: user.friends,
	  friendsRequest: user.friendsRequest
  	}));

	res.status(200).json(filterUsers);
};

//@desc Get a user's Mutual friend List
//@route GET /api/users/mutualUsers/
//@access private
class Graph {
	constructor(noOfVertices) {
	  this.noOfVertices = noOfVertices;
	  this.AdjList = new Map();
	}
  
	addVertex(v) {
	  this.AdjList.set(v, []);
	}
  
	addEdge(v, w) {
	  this.AdjList.get(v).push(w);
	  this.AdjList.get(w).push(v);
	}
  
	dfs(startingNode, count, filteredUser) {
	  const visited = {};
	  this.DFSUtil(startingNode, visited, 0, count, filteredUser);
	}
  
	DFSUtil(vert, visited, num, count, filteredUser) {
	  visited[vert] = true;
  
	  if (num === count) {
		filteredUser.push(vert);
		return;
	  }
  
	  const neighbors = this.AdjList.get(vert);
	  for (let i = 0; i < neighbors.length; i++) {
		const neighbor = neighbors[i];
		if (!visited[neighbor]) {
		  this.DFSUtil(neighbor, visited, num + 1, count, filteredUser);
		}
	  }
	}
  }
  
  const getMutualUsers = async (req, res) => {
	const { id, count } = req.query;

	const user = await User.findById(id);
	if (!user) {
	  return res.status(404).json({ message: "User not found!" });
	}
  
	const users = await User.find({});
	const usersSize = users.length;
  
	const g = new Graph(usersSize);
  
	users.forEach((user) => {
	  g.addVertex(user._id.toString());
	});
  
	await Promise.all(
	  users.map((user) => {
		user.friends.forEach((uid) => {
		  g.addEdge(user._id.toString(), uid.toString());
		});
	  })
	);
  
	let filteredUser = [];
	g.dfs(id, count, filteredUser);
	console.log(filteredUser);
  
	const mutualUsers = users.filter((user) => filteredUser.includes(user._id.toString()));

	console.log(mutualUsers);
  
	res.status(200).json({ user: mutualUsers, message: "send mutal friends" });
};
  



//@desc Send request
//@route POST /api/users/requestuser
//@access private
const requestUser = async (req, res) => {
    const { myId, reqId } = req.body;
    console.log(myId,reqId)
    try {
        const requestedUser = await User.findById(reqId);
        if (!requestedUser) {
            return res.status(404).json({ message: "Requested user not found!" });
        }

        const duplicateUsername = requestedUser.friendsRequest.includes(myId);
        if (duplicateUsername) {
            return res.status(400).json({ message: "Friend request already sent!" });
        }

        const MyUser = await User.findById(myId);
        if (!MyUser) {
            return res.status(404).json({ message: "Your user not found!" });
        }

        // Add myId to requested user's friend requests
        await User.findByIdAndUpdate(reqId, { $push: { friendsRequest: myId } }, { new: true });
        
        console.log("Request sent");
        return res.status(200).json({ message: "Request sent successfully" });
    } catch (error) {
        console.error("Error in requestUser:", error.message);
        return res.status(500).json({ error: error.message });
    }
}

//@desc user's request accept
//@route PUT /api/users/acceptUser
//@access private
const acceptUser = async (req, res) => {
	const { myId, reqId } = req.body;
	console.log(myId, reqId);
  
	try {
	  const MyUser = await User.findById(myId);
	  if (!MyUser) {
		return res.status(404).json({ message: "User not found!" });
	  }
  
	  if (!MyUser.friendsRequest.includes(reqId)) {
		return res.status(400).json({ message: "Friend request not found!" });
	  }
  
	  const updatedUser = await User.findByIdAndUpdate(
		myId,
		{
		  $push: { friends: reqId },
		  $pull: { friendsRequest: reqId },
		},
		{ new: true }
	  );
  
	  console.log("Request accepted");
  
	  return res.status(200).json({ user: updatedUser, message: "Request accepted" });
	} catch (error) {
	  return res.status(500).json({ error: error.message });
	}
  };
  
//@desc user's request reject
//@route PUT /api/users/rejectUser
//@access private
const rejectUser = async (req, res) => {
	const { myId, reqId } = req.body;
  
	try {
	  const MyUser = await User.findById(myId);
	  if (!MyUser) {
		return res.status(404).json({ message: "User not found!" });
	  }
  
	  if (!MyUser.friendsRequest.includes(reqId)) {
		return res.status(400).json({ message: "Friend request not found!" });
	  }
  
	  const updatedUser = await User.findByIdAndUpdate(
		myId,
		{
		  $pull: { friendsRequest: reqId },
		},
		{ new: true }
	  );
  
	  console.log("Request rejected");
	  return res.status(200).json({ user: updatedUser, message: "Request rejected" });

	} catch (error) {
	  return res.status(500).json({ error: error.message });
	}
  };
  
export { getAllUser, getMutualUsers, requestUser, acceptUser, rejectUser};
