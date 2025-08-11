function socketHandler(io) {
  // Store connected users
  const connectedUsers = new Map();
  
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    
    // Handle user authentication for socket
    socket.on('authenticate', (data) => {
      try {
        const { userId, role, name } = data;
        
        // Store user info
        connectedUsers.set(socket.id, {
          userId,
          role,
          name,
          connectedAt: new Date()
        });
        
        // Join user-specific room
        socket.join(`user_${userId}`);
        
        // Join role-specific room
        socket.join(`role_${role}`);
        
        console.log(`✅ User authenticated: ${name} (${role}) - Socket: ${socket.id}`);
        
        // Emit authentication success
        socket.emit('authenticated', {
          message: 'Successfully authenticated',
          userId,
          socketId: socket.id
        });
        
        // Notify other users (admin only)
        socket.to('role_admin').emit('user_connected', {
          userId,
          role,
          name,
          socketId: socket.id,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('auth_error', {
          message: 'Authentication failed'
        });
      }
    });
    
    // Handle real-time transaction tracking
    socket.on('track_transaction', (data) => {
      try {
        const { transactionId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        // Join transaction-specific room
        socket.join(`transaction_${transactionId}`);
        
        console.log(`📊 User ${user.name} tracking transaction: ${transactionId}`);
        
        socket.emit('tracking_started', {
          transactionId,
          message: 'Real-time tracking enabled'
        });
        
      } catch (error) {
        console.error('Transaction tracking error:', error);
        socket.emit('error', { message: 'Failed to start tracking' });
      }
    });
    
    // Handle stop tracking
    socket.on('stop_tracking', (data) => {
      try {
        const { transactionId } = data;
        socket.leave(`transaction_${transactionId}`);
        
        socket.emit('tracking_stopped', {
          transactionId,
          message: 'Real-time tracking disabled'
        });
        
      } catch (error) {
        console.error('Stop tracking error:', error);
      }
    });
    
    // Handle chat/messaging
    socket.on('send_message', (data) => {
      try {
        const { recipientId, message, transactionId } = data;
        const sender = connectedUsers.get(socket.id);
        
        if (!sender) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        const messageData = {
          id: require('uuid').v4(),
          senderId: sender.userId,
          senderName: sender.name,
          message,
          transactionId,
          timestamp: new Date()
        };
        
        // Send to recipient
        socket.to(`user_${recipientId}`).emit('new_message', messageData);
        
        // Send confirmation to sender
        socket.emit('message_sent', messageData);
        
        console.log(`💬 Message from ${sender.name} to user ${recipientId}`);
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { recipientId } = data;
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        socket.to(`user_${recipientId}`).emit('user_typing', {
          userId: user.userId,
          name: user.name
        });
      }
    });
    
    socket.on('typing_stop', (data) => {
      const { recipientId } = data;
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        socket.to(`user_${recipientId}`).emit('user_stopped_typing', {
          userId: user.userId,
          name: user.name
        });
      }
    });
    
    // Handle analytics subscriptions
    socket.on('subscribe_analytics', () => {
      const user = connectedUsers.get(socket.id);
      
      if (user && ['admin', 'supplier', 'distributor'].includes(user.role)) {
        socket.join('analytics_subscribers');
        socket.emit('analytics_subscribed', {
          message: 'Subscribed to real-time analytics updates'
        });
      } else {
        socket.emit('error', { message: 'Not authorized for analytics subscription' });
      }
    });
    
    socket.on('unsubscribe_analytics', () => {
      socket.leave('analytics_subscribers');
      socket.emit('analytics_unsubscribed', {
        message: 'Unsubscribed from analytics updates'
      });
    });
    
    // Handle notifications
    socket.on('mark_notification_read', (data) => {
      const { notificationId } = data;
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        // Broadcast to user's other sessions
        socket.to(`user_${user.userId}`).emit('notification_read', {
          notificationId,
          readBy: user.userId,
          timestamp: new Date()
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        console.log(`🔌 User disconnected: ${user.name} (${user.role}) - Reason: ${reason}`);
        
        // Notify other users (admin only)
        socket.to('role_admin').emit('user_disconnected', {
          userId: user.userId,
          role: user.role,
          name: user.name,
          reason,
          timestamp: new Date()
        });
        
        connectedUsers.delete(socket.id);
      } else {
        console.log(`🔌 Unknown user disconnected: ${socket.id} - Reason: ${reason}`);
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  // Periodic cleanup of inactive connections
  setInterval(() => {
    const now = new Date();
    const staleConnections = [];
    
    connectedUsers.forEach((user, socketId) => {
      const timeDiff = now - user.connectedAt;
      // Remove connections older than 24 hours
      if (timeDiff > 24 * 60 * 60 * 1000) {
        staleConnections.push(socketId);
      }
    });
    
    staleConnections.forEach(socketId => {
      connectedUsers.delete(socketId);
    });
    
    if (staleConnections.length > 0) {
      console.log(`🧹 Cleaned up ${staleConnections.length} stale connections`);
    }
  }, 60 * 60 * 1000); // Run every hour
  
  // Utility functions for emitting events from routes
  io.emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };
  
  io.emitToRole = (role, event, data) => {
    io.to(`role_${role}`).emit(event, data);
  };
  
  io.emitToTransaction = (transactionId, event, data) => {
    io.to(`transaction_${transactionId}`).emit(event, data);
  };
  
  io.emitToAnalytics = (event, data) => {
    io.to('analytics_subscribers').emit(event, data);
  };
  
  // Return connection stats
  io.getStats = () => {
    return {
      totalConnections: io.sockets.sockets.size,
      authenticatedUsers: connectedUsers.size,
      rooms: Object.keys(io.sockets.adapter.rooms),
      connectedUsers: Array.from(connectedUsers.values())
    };
  };
  
  console.log('🔄 Socket.IO initialized with real-time features');
}

module.exports = socketHandler;
