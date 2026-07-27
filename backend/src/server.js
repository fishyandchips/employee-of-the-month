import "dotenv/config";
import express from "express";
import cors from "cors";
import { client } from "./db.js";
import {
  setCookie,
  getUser,
  authenticate,
} from "./auth.js";
import {
  getEmployee,
  getCertifications,
} from "./profile.js";
import {
  getScore,
  getSender,
  stillCooldown,
  recipientExists,
  transfer,
} from "./transfer.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://redacted-center.vercel.app",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/auth", authenticate, (req, res) => {
  res.json({
    authenticated: true,
    userId: req.userId
  });
});

app.get("/employees", authenticate, async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      sort = "name",
    } = req.query;

    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.pageLimit) || 25;

    const result = await client.query(`SELECT e.id, e.name, e.position, e.email, e.status FROM employees e WHERE e.name ILIKE '%${search}%' AND e.status ILIKE '%${status}%' ORDER BY ${sort}`);
    const total = result.rows.length;
    const offset = (page - 1) * pageLimit;
    const employees = result.rows.slice(offset, offset + pageLimit);

    res.json({
      employees,
      totalPages: Math.ceil(total / pageLimit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/profile/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { about } = req.body;

    await client.query(
      `
      UPDATE 
        employees
      SET 
        about = $1
      WHERE 
        id = $2
      `,
      [
        about,
        id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/profile/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await getEmployee(id);
    if (!employee) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    const certifications = await getCertifications(id);

    res.json({
      employee,
      certifications,
      isOwnProfile: id === req.userId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await getUser(email, password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  await setCookie(res, user.id);
  res.json({ success: true });
});

app.post('/logout', async (req, res) => {
  res.clearCookie("session_id");
  res.json({ success: true });
});

app.get("/score", authenticate, async (req, res) => {
  try {
    const score = await getScore(req.userId);

    if (score === null) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      score
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/score", authenticate, async (req, res) => {
  let { recipientId, amount } = req.body;
  amount = Number(amount);

  if (!recipientId || !Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid transfer" });
  }

  if (amount > 5000000) {
    return res.status(400).json({ error: "Max transfer is 5,000,000 score" });
  }

  if (recipientId === req.userId) {
    return res.status(400).json({ error: "Cannot transfer to self" });
  }

  try {
    const sender = await getSender(req.userId);
    if (!sender) {
      return res.status(404).json({ error: "User not found" });
    }

    const { score, last_transfer_at } = sender;
    if (stillCooldown(last_transfer_at)) {
      return res.status(400).json({ error: "Cooldown timer has not elapsed" });
    }
    if (score < amount) {
      return res.status(400).json({ error: "Insufficient score" });
    }

    if (!await recipientExists(recipientId)) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const newSenderScore = await transfer(req.userId, recipientId, amount);

    res.json({
      score: newSenderScore
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/leaderboard", authenticate, async (req, res) => {
  try {
    const leaderboard = await client.query(
      `
      SELECT 
        id, 
        name, 
        score
      FROM 
        employees
      ORDER BY 
        score DESC
      LIMIT 10
      `
    );

    res.json({
      leaderboard: leaderboard.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
