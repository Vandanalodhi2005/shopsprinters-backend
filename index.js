const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();
connectDB();

const app = express();


// Middleware
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "https://printsmatrix1.netlify.app",
            "http://localhost:5173",
            "https://innovationdynamicsgroup.com/",
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});


app.use(cors())
app.use(express.json());
// Serve uploaded product images with long-term cache headers (1 year)
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    next();
}, express.static('uploads'));

// Make io accessible to our routers
app.set('io', io);

// Routes
app.get('/', (req, res) => {
    res.send('Hello from backend!');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));

// Config routes
app.get('/api/config/clover', (req, res) => {
    res.json(process.env.CLOVER_PUBLIC_KEY);
});


// Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    } else {
        next(new Error('Authentication error'));
    }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join user's personal room
    socket.join(`user-${socket.userId}`);

    // Join chat room
    socket.on('join-chat', (chatId) => {
        socket.join(`chat-${chatId}`);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Send message event
    socket.on('send-message', (data) => {
        const { chatId, message, sender } = data;
        // Broadcast to all users in the chat room
        io.to(`chat-${chatId}`).emit('new-message', {
            chatId,
            message,
            sender,
            timestamp: new Date()
        });
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { chatId, isTyping, userName } = data;
        socket.to(`chat-${chatId}`).emit('user-typing', {
            chatId,
            isTyping,
            userName
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
    });
});

// Error Handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export io for use in other files if needed
module.exports = { io };
