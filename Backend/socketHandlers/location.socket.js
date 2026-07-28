/**
 * Socket.IO handlers for location real-time events
 */

class LocationSocketHandler {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Join location room for real-time updates
    this.io.on('connection', (socket) => {
      socket.on('location:join', () => {
        socket.join('location:updates');
        console.log(`Socket ${socket.id} joined location updates room`);
      });

      socket.on('location:leave', () => {
        socket.leave('location:updates');
        console.log(`Socket ${socket.id} left location updates room`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  }

  /**
   * Emit location updated event
   */
  emitLocationUpdated(location) {
    this.io.to('location:updates').emit('location:updated', location);
  }

  /**
   * Emit location added event
   */
  emitLocationAdded(location) {
    this.io.to('location:updates').emit('location:added', location);
  }

  /**
   * Emit location removed event
   */
  emitLocationRemoved(locationId) {
    this.io.to('location:updates').emit('location:removed', { locationId });
  }

  /**
   * Emit user online status changed event
   */
  emitUserOnlineStatusChanged(uid, isOnline) {
    this.io.to('location:updates').emit('user:online_status_changed', { uid, isOnline });
  }
}

module.exports = LocationSocketHandler;
