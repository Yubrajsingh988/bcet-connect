// backend/src/sockets/ioManager.js
let _io = null;

module.exports = {
  init(io) {
    _io = io;
  },
  get io() {
    if (!_io) {
      throw new Error("Socket.io not initialized. Call ioManager.init(io) in server startup.");
    }
    return _io;
  },
};
