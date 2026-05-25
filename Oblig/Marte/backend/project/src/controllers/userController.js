const User = require("../models/User");
const Game = require("../models/Game");

// admin only: get all users with search and pagination
const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};

    // if search query is provided, search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get users" });
  }
};

// get a single user profile
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // get the 10 most recent games for this user
    const recentGames = await Game.find({
      $or: [{ playerOne: user._id }, { playerTwo: user._id }],
      status: "finished",
      isAnonymous: false,
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("variant status winner createdAt");

    // calculate ELO change in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekOldElo = user.eloHistory
      .filter((e) => e.date <= oneWeekAgo)
      .pop();

    const eloChangeThisWeek = weekOldElo
      ? user.eloRating - weekOldElo.rating
      : 0;

    res.json({ user, recentGames, eloChangeThisWeek });
  } catch (err) {
    res.status(500).json({ error: "Failed to get user" });
  }
};

// register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, age } = req.body;

    // validate required fields
    if (!username || !email || !password || !age) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check minimum age requirement from assignment
    if (age < 18) {
      return res
        .status(400)
        .json({ error: "You must be at least 18 years old to register" });
    }

    // check if username or email already exists
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ error: "Username or email already taken" });
    }

    const user = await User.create({ username, email, password, age });

    // return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "User registered successfully", user: userResponse });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// basic login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "This account has been banned" });
    }

    // return the user role and id for use in headers
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      userId: user._id,
      role: user.role,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
};

// update user profile
const updateUser = async (req, res) => {
  try {
    // users can only update their own profile, admins can update anyone
    if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own profile" });
    }

    const { email, password, age, preferences, avatar, aboutMe } = req.body;

    // username cannot be updated, assignment requirement
    if (req.body.username) {
      return res.status(400).json({ error: "Username cannot be changed" });
    }

    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (aboutMe !== undefined) updates.aboutMe = aboutMe;
    // Save appearance preferences so they follow the user across devices
    if (preferences) updates.preferences = preferences;
    // avatar is a base64 string, null clears it
    if (avatar !== undefined) updates.avatar = avatar;
    if (age) {
      if (age < 18) {
        return res.status(400).json({ error: "Age must be at least 18" });
      }
      updates.age = age;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// admin only: ban a user
const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User banned successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to ban user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  banUser,
};
