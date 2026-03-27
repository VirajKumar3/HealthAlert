const Message = require('../models/Message');

const getMessagesByEmergency = async (req, res) => {
  try {
    const messages = await Message.find({ emergency: req.params.emergencyId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { emergencyId, content } = req.body;
  try {
    const message = await Message.create({
      emergency: emergencyId,
      sender: req.user._id,
      content,
    });
    const populatedMessage = await Message.findById(message._id).populate('sender', 'name role');
    
    // Emit to relevant room (emergency-id)
    req.io.to(`emergency-${emergencyId}`).emit('new_message', populatedMessage);
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMessagesByEmergency, sendMessage };
