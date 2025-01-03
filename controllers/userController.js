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
//@route GET /api/users/mutualUsers/:id
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
	const { id, count } = req.body;
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({ message: "User not found!" });
	}
	
	const users = await User.find({});
	const usersSize = users.length;
	
	const g = new Graph(usersSize);
  
	// Adding vertices to the graph
	users.forEach((user) => {
	  g.addVertex(user._id);
	});
  
	// Adding edges to the graph based on friendships
	await Promise.all(
	  users.map((user) => {
		user.friends.forEach((uid) => {
		  g.addEdge(user._id, uid);
		});
	  })
	);
  
	let filteredUser = [];
	g.dfs(id, count, filteredUser);
  
	// Find mutual users (those who are in the filteredUser array)
	const mutualUsers = users.filter((user) => filteredUser.includes(user._id));
  
	res.status(200).json(mutualUsers);
};
  
//@desc Send request
//@route POST /api/users/requestUser
//@access private
const requestUser = async (req,res) => {
	const {myId,reqId} = req.body;
	const requestedUser = await User.findById(reqId);
	const MyUser = await User.findById(myId);

	if (!requestedUser || !MyUser) {
		return res.status(404).json({ message: "User not found!" });
	}
	try {
		await User.findByIdAndUpdate(reqId,{ $push: { friendsRequest: myId } },{ new: true });
		  console.log("request send");
		  return res.status(200).json({ message: "request send" });		
		}
	catch (error) {
		return res.status(500).json({ error: error.message });
	}
}

//@desc user's request accept
//@route PUT /api/users/acceptUser/:id
//@access private
const acceptUser = async () => {
	const {myId,reqId} = req.body;
	const MyUser = await User.findById(myId);
	const requestedUser = MyUser.friendsRequest.filter((id)=> id === reqId);

	if (!requestedUser || !MyUser) {
		return res.status(404).json({ message: "User not found!" });
	}
	try {
		await User.findByIdAndUpdate(myId,{ $push: { friend: reqId } },{ new: true });
		await User.findByIdAndUpdate(myId,{ $pull: { friendsRequest: reqId } },{ new: true });
		  console.log("request accepted");
		  return res.status(200).json({ message: "request accepted" });
		}
	catch (error) {
		return res.status(500).json({ error: error.message });
	}
}

//@desc user's request reject
//@route PUT /api/users/rejectUser/:id
//@access private
const rejectUser = async () => {
	const {myId,reqId} = req.body;
	const MyUser = await User.findById(myId);
	const requestedUser = MyUser.friendsRequest.filter((id)=> id === reqId);

	if (!requestedUser || !MyUser) {
		return res.status(404).json({ message: "User not found!" });
	}
	try {
		await User.findByIdAndUpdate(myId,{ $pull: { friendsRequest: reqId } },{ new: true });
		  console.log("request rejected");
		  return res.status(200).json({ message: "request rejected" });
		}
	catch (error) {
		return res.status(500).json({ error: error.message });
	}
}	  

export { getAllUser, getMutualUsers, requestUser, acceptUser, rejectUser};























// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import Song from "../models/Song.js";
// import Playlist from "../models/Playlist.js";

// //@desc Get all users
// //@route GET /api/users/allusers
// //@access public
// const getAllUser = async (req, res) => {
// 	const users = await User.find({});
  
// 	if (!users) {
// 	  return res.status(400).json({ message: "No user found" });
// 	}
  
// 	const filterUsers = users.map((user) => ({
// 	  id: user._id,
// 	  username: user.username,
// 	  hobbies: user.hobbies,
// 	  friends: user.friends,
// 	  friendsRequest: user.friendsRequest
//   	}));

// 	res.status(200).json(filterUsers);
// };


// //@desc Get users based having same hoobies
// //@route GET /api/users/hobbies
// //@access public
// // const getUserHobbies = async (req,res) => {
// // 	const { id } = req.params;
// // //	const { id } = req.user;
// // 	const user = await User.findById(id);

// // 	if (!user) {
// // 		return res.status(404).json({ message: "User not found!" });
// // 	}
// // 	const hobbies = user.hobbies;

// // 	if (hobbies.length < 1) {
// // 		return res.status(404).json({ message: "No hoobies found!" });
// // 	}

// // 	const allUsers = await User.find({});

// // 	if (!allUsers) {
// // 		return res.status(400).json({ message: "No user found" });
// // 	}

// // 	const filterUser = allUsers((user)=>{
// // 		return 
// // 	})


  
// // 	res.status(200).json(hobbies);




// // 	const users = await User.find({});
  
// // 	if (!users) {
// // 	  return res.status(400).json({ message: "No user found" });
// // 	}
  
// // 	const filterUsers = users.map((user) => ({
// // 	  id: user._id,
// // 	  username: user.username,
// // 	  hobbies: user.hobbies,
// // 	  friends: user.friends,
// // 	  friendsRequest: user.friendsRequest
// //   	}));

// // 	res.status(200).json(filterUsers);
// // }

// //@desc Get a user's favorite songs
// //@route GET /api/songs/user/favorites
// //@access private





// // class Graph{
// // 	constructor(noOfVertices)
// //     {
// //         this.noOfVertices = noOfVertices;
// //         this.AdjList = new Map();
// //     }
// // 	addVertex(v){
// //     	this.AdjList.set(v, []);
// // 	}
// // 	addEdge(v, w){
// // 		this.AdjList.get(v).push(w);
// // 		this.AdjList.get(w).push(v);
// // 	}
// // 	dfs(startingNode,count,filteredUser)
// // 	{
// // 		var visited = {};
// // 		this.DFSUtil(startingNode, visited, 0, count,filteredUser);
// // 	}

// // 	DFSUtil(vert, visited, num ,count)
// // 	{
// // 		visited[vert] = true;

// // 		console.log(vert);
// // 		if(num == count){
// // 			filteredUser.push(vert);
// // 			return ;
// // 		}

// // 		var get_neighbours = this.AdjList.get(vert);

// // 		for (var i in get_neighbours) {
// // 			var get_elem = get_neighbours[i];
// // 			if (!visited[get_elem])
// // 				this.DFSUtil(get_elem, visited);
// // 		}
// // 	}
// // }
// // const getMutualUsers = async (req,res) => {
// // 	const { id,count } = req.body;
// // //	const { id } = req.user;
// // 	const user = await User.findById(id);
// // 	const users = await User.find({});
// // 	let UsersSize = users.length;

// // 	let g = new Graph(UsersSize);
// // 	users.forEach((user)=>{
// // 		g.addVertex(user._id);
// // 	})
// // 	await Promise.all(
// // 		users.map((user)=>{
// // 			user.friends.forEach((uid)=>{
// // 				g.addEdge(user._id, uid);
// // 			})
// // 		})
// // 	)
// // 	let filteredUser = new Array();
// // 	const filterUser = dfs(id,count,filteredUser)
// // 	const getMutualUsers = users.map((user)=>{
// // 		return filterUser.find(user._id)
// // 	})

// // 	res.status(200).json(getMutualUsers);
// // }

// class Graph {
// 	constructor(noOfVertices) {
// 	  this.noOfVertices = noOfVertices;
// 	  this.AdjList = new Map();
// 	}
  
// 	addVertex(v) {
// 	  this.AdjList.set(v, []);
// 	}
  
// 	addEdge(v, w) {
// 	  this.AdjList.get(v).push(w);
// 	  this.AdjList.get(w).push(v);
// 	}
  
// 	dfs(startingNode, count, filteredUser) {
// 	  const visited = {};
// 	  this.DFSUtil(startingNode, visited, 0, count, filteredUser);
// 	}
  
// 	DFSUtil(vert, visited, num, count, filteredUser) {
// 	  visited[vert] = true;
  
// 	  if (num === count) {
// 		filteredUser.push(vert);
// 		return;
// 	  }
  
// 	  const neighbors = this.AdjList.get(vert);
// 	  for (let i = 0; i < neighbors.length; i++) {
// 		const neighbor = neighbors[i];
// 		if (!visited[neighbor]) {
// 		  this.DFSUtil(neighbor, visited, num + 1, count, filteredUser);
// 		}
// 	  }
// 	}
//   }
  
//   const getMutualUsers = async (req, res) => {
// 	const { id, count } = req.body;
// 	const user = await User.findById(id);
// 	const users = await User.find({});
// 	const usersSize = users.length;
  
// 	const g = new Graph(usersSize);
  
// 	// Adding vertices to the graph
// 	users.forEach((user) => {
// 	  g.addVertex(user._id);
// 	});
  
// 	// Adding edges to the graph based on friendships
// 	await Promise.all(
// 	  users.map((user) => {
// 		user.friends.forEach((uid) => {
// 		  g.addEdge(user._id, uid);
// 		});
// 	  })
// 	);
  
// 	let filteredUser = [];
// 	g.dfs(id, count, filteredUser);
  
// 	// Find mutual users (those who are in the filteredUser array)
// 	const mutualUsers = users.filter((user) => filteredUser.includes(user._id));
  
// 	res.status(200).json(mutualUsers);
//   };
  








// // class Graph{
// // 	constructor(noOfVertices)
// //     {
// //         this.noOfVertices = noOfVertices;
// //         this.AdjList = new Map();
// //     }
// // 	addVertex(v){
// //     	this.AdjList.set(v, []);
// // 	}
// // 	addEdge(v, w){
// // 		this.AdjList.get(v).push(w);
// // 		this.AdjList.get(w).push(v);
// // 	}
// // }
// // const getUserMutualUsers = async (req,res) => {
// // 	const { id,count } = req.body;
// // //	const { id } = req.user;
// // 	const user = await User.findById(id);
// // 	const users = await User.find({});

// // 	let g = new Graph(users.length);
// // 	let vertices = new Array();
// // 	let userToVertices = [];
// // 	users.forEach((user)=>{
// // 		userToVertices.push(user._id);
// // 	})

// // 	// adding vertices
// // 	for (let i = 0; i < vertices.length; i++) {
// // 		vertices.push(i);
// // 		g.addVertex(vertices[i]);
// // 	}

// // 	// adding edges

// // 	g.addEdge('A', 'B');
// // 	g.addEdge('A', 'D');
// // 	g.addEdge('A', 'E');
// // 	g.addEdge('B', 'C');
// // 	g.addEdge('D', 'E');
// // 	g.addEdge('E', 'F');
// // 	g.addEdge('E', 'C');
// // 	g.addEdge('C', 'F');


// // 	if (!user) {
// // 		return res.status(404).json({ message: "User not found!" });
// // 	}
// // 	const Userfriends = user.friends;

// // 	if (Userfriends.length < 1) {
// // 		return res.status(404).json({ message: "No friends found!" });
// // 	}

// // 	const allUsers = await User.find({});

// // 	const mutualUsers = await Promise.all(
// // 		allUsers.friends.map((id) => {
// // 			let num=0;
// // 			Userfriends.forEach((fri_id)=>{

// // 			})
// // 		Song.findById(id)})
// // 	);

// // 	if (!allUsers) {
// // 		return res.status(400).json({ message: "No user found" });
// // 	}

// // 	const filterUser = allUsers((user)=>{
// // 		return 
// // 	})  
// // 	res.status(200).json(hobbies);
// // }

// //@desc Get a user's favorite songs
// //@route GET /api/users/requestUser
// //@access private
// const requestUser = async (req,res) => {
// 	const {myId,reqId} = req.body;
// 	const requestedUser = await User.findById(reqId);
// 	const MyUser = await User.findById(myId);

// 	if (!requestedUser || !MyUser) {
// 		return res.status(404).json({ message: "User not found!" });
// 	}
// 	try {
// 		await User.findByIdAndUpdate(reqId,{ $push: { friendsRequest: myId } },{ new: true });
// 		  console.log("request send");
// 		  return res.status(200).json({ message: "request send" });		
// 		}
// 	catch (error) {
// 		return res.status(500).json({ error: error.message });
// 	}
// }
// //@desc Get a user's favorite songs
// //@route GET /api/songs/user/favorites
// //@access private
// const acceptUser = async () => {
// 	const {myId,reqId} = req.body;
// 	const MyUser = await User.findById(myId);
// 	const requestedUser = MyUser.friendsRequest.filter((id)=> id === reqId);

// 	if (!requestedUser || !MyUser) {
// 		return res.status(404).json({ message: "User not found!" });
// 	}
// 	try {
// 		await User.findByIdAndUpdate(myId,{ $push: { friend: reqId } },{ new: true });
// 		await User.findByIdAndUpdate(myId,{ $pull: { friendsRequest: reqId } },{ new: true });
// 		  console.log("request accepted");
// 		  return res.status(200).json({ message: "request accepted" });
// 		}
// 	catch (error) {
// 		return res.status(500).json({ error: error.message });
// 	}
// }

// //@desc Get a user's favorite songs
// //@route POST /api/users/user/favorites
// //@access private
// const rejectUser = async () => {
// 	const {myId,reqId} = req.body;
// 	const MyUser = await User.findById(myId);
// 	const requestedUser = MyUser.friendsRequest.filter((id)=> id === reqId);

// 	if (!requestedUser || !MyUser) {
// 		return res.status(404).json({ message: "User not found!" });
// 	}
// 	try {
// 		await User.findByIdAndUpdate(myId,{ $pull: { friendsRequest: reqId } },{ new: true });
// 		  console.log("request rejected");
// 		  return res.status(200).json({ message: "request rejected" });
// 		}
// 	catch (error) {
// 		return res.status(500).json({ error: error.message });
// 	}
// }	  

// export { getAllUser, getUserMutualUsers, requestUser, acceptUser, rejectUser};
