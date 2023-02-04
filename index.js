const express = require("express");
const app = express();
const http = require("http");

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const orders = [];

class Order {
    constructor(id, item) {
        this.id = id;
        this.item = item;
        this.status = 'pending';
    }
}


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/admin", (req, res) => {
    res.sendFile(__dirname + "/admin.html");
  });

// let adminSocket;

io.on("connection", (socket) => {
  console.log("client connected", socket.id);
//   console.log(socket)

  // const userType = socket.handshake.auth.user_type

  // if (userType === 'admin') {
  //   adminSocket = socket;
  // }

  // socket.emit('eventName', data);
  socket.emit("connected", "connected to backend server");

  
  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });


  socket.on("order_requested", (data) => {
    console.log("order: ", data);

    const order = new Order(data.id, data.item)
    socket.emit('processing_order', { message: `Order ${order.id} is being processed`})
    orders.push(order);

    socket.broadcast.emit('processing_order_admin', { 
      message: 'Order requested', 
      order
    });

  });

  socket.on('admin_action', (data) => {
    const { action, order } = data;

    if (action === 'accept') {
        socket.broadcast.emit('order_accepted', { message: `Order ${order.id} is accepted`})
    }

    if (action === 'reject') {
        socket.broadcast.emit('order_rejected', { message: `Order ${order.id} is rejected`})
    }
  })
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
