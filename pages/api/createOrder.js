// API endpoint to create a Razorpay order
import Razorpay from 'razorpay';
import connectDb from "../../middleware/dbConnect";
import mongoose from 'mongoose';
import User from '../../models/User';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Extract parameters from request
    const { email, interviewCount = 1 } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate amount (₹1 per interview)
    const amount = interviewCount * 100; // Amount in paise (1 rupee = 100 paise)
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_WoTJk5jAZVzbV4',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'ez6nHdZi8Xjg85r4WXgh0tXi'
    });

    // Create receipt ID
    const receiptId = uuidv4();

    // Create order
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        email: user.email,
        interviewCount,
        userId: user._id.toString()
      }
    });

    return res.status(200).json({
      orderId: order.id,
      amount: amount / 100, // Send amount in rupees for display
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_WoTJk5jAZVzbV4',
      email: user.email,
      name: user.fullName || 'User',
      notes: {
        interviewCount,
        userId: user._id.toString(),
      }
    });
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
};

export default connectDb(handler);
