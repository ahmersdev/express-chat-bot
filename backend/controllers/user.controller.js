import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json({
      data: filteredUser,
      message: "All Users Fetched Successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error.message);

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};
