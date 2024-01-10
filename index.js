const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
let rooms = [];
let bookings = [];
app.use(bodyParser.json());

app.post("/create-room", (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;
  const existingRoom = rooms.find((room) => room.name === roomName);
  if (existingRoom) {
    return res.status(400).json({ error: "Room already exists" });
  }

  const newRoom = {
    name: roomName,
    seats,
    amenities,
    pricePerHour,
  };

  rooms.push(newRoom);
  res.status(201).json({ message: "Room created successfully", room: newRoom });
});

app.post("/book-room", (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  const room = rooms.find((room) => room.name === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const conflictingBooking = bookings.find(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime))
  );

  if (conflictingBooking) {
    return res
      .status(400)
      .json({ error: "Room already booked for the given date and time" });
  }

  const newBooking = {
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    bookingId: bookings.length + 1,
    bookingDate: new Date(),
    bookingStatus: "Confirmed",
  };

  bookings.push(newBooking);
  res
    .status(201)
    .json({ message: "Room booked successfully", booking: newBooking });
});

app.get("/list-rooms", (req, res) => {
  const roomsWithBookings = rooms.map((room) => {
    const bookedData = bookings.filter(
      (booking) => booking.roomId === room.name
    );
    return {
      roomName: room.name,
      bookedData,
    };
  });

  res.json(roomsWithBookings);
});

app.get("/list-customers", (req, res) => {
  const customersWithBookings = bookings.map((booking) => {
    const room = rooms.find((room) => room.name === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });

  res.json(customersWithBookings);
});

app.get("/customer-booking-history/:customerName", (req, res) => {
  const { customerName } = req.params;

  const customerBookingHistory = bookings.filter(
    (booking) => booking.customerName === customerName
  );

  res.json(customerBookingHistory);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
