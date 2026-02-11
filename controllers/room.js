// controllers/room.js
const prisma = require("../config/prisma");

// สร้างห้อง
exports.create = async (req, res) => {
  try {
    const { roomNumber, building, floor, imageUrl } = req.body;

    // Check for duplicate room number
    const existingRoom = await prisma.room.findFirst({
      where: { roomNumber },
    });

    if (existingRoom) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        building,
        floor: floor ? parseInt(floor) : null,
        imageUrl,
      },
    });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ดูรายการห้องทั้งหมด
exports.list = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        _count: {
          select: { equipments: true },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// อัพเดทข้อมูลห้อง
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, building, floor, imageUrl } = req.body;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check duplicate room number ONLY if it's being changed
    if (roomNumber && roomNumber !== existingRoom.roomNumber) {
      const duplicate = await prisma.room.findFirst({
        where: { roomNumber }
      });
      if (duplicate) {
        return res.status(400).json({ message: "Room number already exists" });
      }
    }

    const updated = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        roomNumber,
        building,
        floor: floor ? parseInt(floor) : null,
        imageUrl,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ลบห้อง
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.room.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
