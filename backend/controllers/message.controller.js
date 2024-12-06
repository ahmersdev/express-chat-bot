import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        message: "Invalid receiver ID",
        status: 400,
        success: false,
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({ senderId, receiverId, message });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // await conversation.save();
    // await newMessage.save();

    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({
      chat: newMessage,
      message: "Message sent successfully",
      status: 201,
      success: true,
    });
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: errors.join(", "),
        status: 400,
        success: false,
      });
    }

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({
        message: "Invalid receiver ID",
        status: 400,
        success: false,
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        chat: [],
        message: "No messages found",
        status: 200,
        success: true,
      });
    }

    const chat = conversation.messages;
    res.status(200).json({
      chat,
      message: "Messages fetched successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    console.log("Error in getMessages controller", error.message);

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};
