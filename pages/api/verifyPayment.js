// API endpoint to verify a Razorpay payment and update user's interview count
import Razorpay from 'razorpay';
import connectDb from "../../middleware/dbConnect";
import mongoose from 'mongoose';
import User from '../../models/User';
import crypto from 'crypto';

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, notes } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification parameters' });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_WoTJk5jAZVzbV4',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'ez6nHdZi8Xjg85r4WXgh0tXi'
    });

    // Verify the signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'ez6nHdZi8Xjg85r4WXgh0tXi')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get order details to extract the user ID and interview count
    const order = await razorpay.orders.fetch(razorpay_order_id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { email, interviewCount, userId } = order.notes;
    
    if (!email || !userId) {
      return res.status(400).json({ error: 'User information missing from order notes' });
    }

    // Find and update the user's interview count
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize the interview fields if they don't exist
    if (typeof user.no_of_interviews !== 'number') {
      user.no_of_interviews = 1;
    }
    
    if (typeof user.no_of_interviews_completed !== 'number') {
      user.no_of_interviews_completed = 0;
    }

    // Add the purchased interviews to the user's account
    user.no_of_interviews += parseInt(interviewCount, 10);
    
    // Ensure collageName is set if it's missing but required
    if (user.collageName === undefined || user.collageName === null) {
      // You can set a default value if the user doesn't have a college name
      user.collageName = user.collageName || 'Not Specified';
    }
    
    // Save the updated user with validation
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: `Successfully added ${interviewCount} interview(s) to your account`,
      user: {
        email: user.email,
        no_of_interviews: user.no_of_interviews,
        no_of_interviews_completed: user.no_of_interviews_completed,
      }
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export default connectDb(handler);
