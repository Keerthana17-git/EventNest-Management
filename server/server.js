const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// MONGODB CONNECTION
// ======================================================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing from .env file");
  process.exit(1);
}

// ======================================================
// EVENT MODEL
// ======================================================

const eventSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

// ======================================================
// USER MODEL
// ======================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "organizer", "participant"],
      default: "participant",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// ======================================================
// REGISTRATION MODEL
// ======================================================

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: Number,
      required: true,
    },

    eventName: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "EventNest server is running",
  });
});

// ======================================================
// EVENT APIs
// ======================================================

// GET ALL EVENTS

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ id: 1 });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);

    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

// GET SINGLE EVENT

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      id: Number(req.params.id),
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);

    res.status(500).json({
      message: "Failed to fetch event",
    });
  }
});

// CREATE EVENT

app.post("/api/events", async (req, res) => {
  try {
    const {
      name,
      date,
      location,
      description,
    } = req.body;

    if (!name || !date || !location || !description) {
      return res.status(400).json({
        message: "All event fields are required",
      });
    }

    const lastEvent = await Event.findOne().sort({
      id: -1,
    });

    const newId = lastEvent
      ? lastEvent.id + 1
      : 1;

    const event = new Event({
      id: newId,
      name,
      date,
      location,
      description,
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Error creating event:", error);

    res.status(500).json({
      message: "Failed to create event",
    });
  }
});

// DELETE EVENT

app.delete("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      id: Number(req.params.id),
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);

    res.status(500).json({
      message: "Failed to delete event",
    });
  }
});

// ======================================================
// EVENT REGISTRATION APIs
// ======================================================

// REGISTER FOR EVENT

app.post("/api/registrations", async (req, res) => {
  try {
    const {
      eventId,
      eventName,
      name,
      email,
    } = req.body;

    if (!eventId || !eventName || !name || !email) {
      return res.status(400).json({
        message: "All registration fields are required",
      });
    }

    // Check event

    const event = await Event.findOne({
      id: Number(eventId),
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check duplicate registration

    const existingRegistration =
      await Registration.findOne({
        eventId: Number(eventId),
        email: email.toLowerCase(),
      });

    if (existingRegistration) {
      return res.status(400).json({
        message:
          "You are already registered for this event.",
      });
    }

    const registration = new Registration({
      eventId: Number(eventId),
      eventName,
      name,
      email,
    });

    await registration.save();

    // Also create a participant user if
    // this email doesn't already exist

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!existingUser) {
      await User.create({
        name,
        email: email.toLowerCase(),
        password: "eventnest-user",
        role: "participant",
        status: "active",
      });
    }

    console.log(
      `New registration: ${name} - ${eventName}`
    );

    res.status(201).json({
      message: "Registration successful!",
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Unable to register",
    });
  }
});

// GET ALL REGISTRATIONS

app.get("/api/registrations", async (req, res) => {
  try {
    const registrations =
      await Registration.find().sort({
        createdAt: -1,
      });

    res.json(registrations);
  } catch (error) {
    console.error(
      "Error fetching registrations:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch registrations",
    });
  }
});

// GET SINGLE REGISTRATION

app.get(
  "/api/registrations/:id",
  async (req, res) => {
    try {
      const registration =
        await Registration.findById(
          req.params.id
        );

      if (!registration) {
        return res.status(404).json({
          message: "Registration not found",
        });
      }

      res.json(registration);
    } catch (error) {
      console.error(
        "Error fetching registration:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch registration",
      });
    }
  }
);

// DELETE REGISTRATION

app.delete(
  "/api/registrations/:id",
  async (req, res) => {
    try {
      const registration =
        await Registration.findByIdAndDelete(
          req.params.id
        );

      if (!registration) {
        return res.status(404).json({
          message: "Registration not found",
        });
      }

      res.json({
        message:
          "Registration deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error deleting registration:",
        error
      );

      res.status(500).json({
        message: "Failed to delete registration",
      });
    }
  }
);

// ======================================================
// USER MANAGEMENT APIs
// ======================================================

// REGISTER USER

app.post("/api/users/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "participant",
      status: "active",
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "User registration error:",
      error
    );

    res.status(500).json({
      message: "Failed to register user",
    });
  }
});

// GET ALL USERS

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// GET SINGLE USER

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);

    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
});

// DELETE USER

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
});

// ======================================================
// DASHBOARD STATISTICS
// ======================================================

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalEvents =
      await Event.countDocuments();

    const totalUsers =
      await User.countDocuments();

    const totalRegistrations =
      await Registration.countDocuments();

    const activeUsers =
      await User.countDocuments({
        status: "active",
      });

    res.json({
      totalEvents,
      totalUsers,
      totalRegistrations,
      activeUsers,
    });
  } catch (error) {
    console.error(
      "Dashboard statistics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch dashboard statistics",
    });
  }
});

// ======================================================
// START SERVER
// ======================================================

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(
      "MongoDB connected successfully"
    );

    // Add default events only if there are
    // currently no events

    const eventCount =
      await Event.countDocuments();

    if (eventCount === 0) {
      await Event.insertMany([
        {
          id: 1,
          name: "Tech Fest",
          date: "2026-09-10",
          location: "Bangalore",
          description:
            "Technology and innovation event",
        },

        {
          id: 2,
          name: "Cultural Fest",
          date: "2026-09-15",
          location: "Mysore",
          description:
            "Music, dance and cultural programs",
        },
      ]);

      console.log("Default events added");
    }

    const PORT =
      process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `EventNest server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:"
    );

    console.error(error.message);
  });