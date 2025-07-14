const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


global.io = io;


io.on('connection', (socket) => {
  console.log(' Socket connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log(' Socket disconnected:', socket.id);
  });
});


app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


app.get("/status", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});





const authRoutes = require('./Routes/Auth');
const userRoutes = require('./Routes/userRoutes');
const uploadRoutes = require('./Routes/UploadProfile');
const recuriterRoutes = require('./Routes/recuriterRoutes');
const verifyRoutes = require('./Routes/verifyRoutes');
const activityRoutes=require('./Routes/ActivityRoutes')

const notificationRoutes = require('./Routes/notificationRoutes')(io);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recruiters', recuriterRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/notifications', notificationRoutes);


app.use('/api/activities', activityRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(' MongoDB connected');

  
  server.listen(process.env.PORT || 5000, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch(err => {
  console.error(' MongoDB connection error:', err);
});
