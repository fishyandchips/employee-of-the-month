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
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
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

// app.post("/register", async (req, res) => {
//   const { email, password } = req.body;

//   if (await emailExists(email)) {
//     return res.status(409).json({error: "User already exists" });
//   }

//   const id = await createUser(email, password);
//   await setCookie(res, id);

//   res.json({
//     success: true,
//     message: "Account created",
//   });
// });

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
