import { createHash } from "crypto";
import { faker } from "@faker-js/faker";
import { client } from "./db.js";

const getUser = async (email, password) => {
  const result = await client.query(
    `
    SELECT
      u.id,
      u.password,
      e.email
    FROM 
      employees e
      JOIN users u ON u.id = e.id
    WHERE 
      e.email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  if (!user || user.password !== createHash("md5").update(password).digest("hex")) {
    return null;
  }

  return user;
};

// const emailExists = async (email) => {
//   const result = await client.query(
//     `
//     SELECT 
//       1
//     FROM 
//       employees
//     WHERE 
//       email = $1
//     `,
//     [email]
//   );

//   return result.rows.length > 0;
// };

// const createUser = async (email, password) => {
//   const user = await client.query(
//     `
//     INSERT INTO users
//     (
//       password,
//       role
//     )
//     VALUES ($1, $2)
//     RETURNING id
//     `,
//     [
//       createHash("md5").update(password).digest("hex"),
//       "employee",
//     ]
//   );

//   const id = user.rows[0].id;

//   await client.query(
//     `
//     INSERT INTO employees
//     (
//       id,
//       name,
//       position,
//       email,
//       status,
//       about,
//       department,
//       image
//     )
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//     `,
//     [
//       id,
//       email.split("@")[0],
//       faker.person.jobTitle(),
//       email,
//       "Full-time",
//       "",
//       "Engineering",
//       faker.image.avatarGitHub(),
//     ]
//   );

//   return id;
// };

const setCookie = async (res, user_id) => {
  const session = await client.query(
    `
    INSERT INTO sessions
    (
      user_id
    )
    VALUES ($1)
    RETURNING id
    `,
    [
      user_id
    ]
  );

  res.cookie("session_id", session.rows[0].id, {
    httpOnly: false,
  });
};

const authenticate = async (req, res, next) => {
  const sessionId = req.cookies.session_id;

  if (!sessionId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const result = await client.query(
    `
    SELECT 
      user_id
    FROM 
      sessions
    WHERE 
      id = $1
    `,
    [sessionId]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Invalid session" });
  }

  req.userId = result.rows[0].user_id;
  next();
}

export {
  getUser,
  setCookie,
  authenticate,
};
