import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const AdminCollection = mongoose.connection.collection('Admin');
    const admin = await AdminCollection.findOne({ username, password });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful', role: admin.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
