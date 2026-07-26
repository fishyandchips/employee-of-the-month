import { client } from "./db.js";

const getScore = async (id) => {
  const employee = await client.query(
    `
    SELECT 
      score
    FROM 
      employees
    WHERE 
      id = $1
    `,
    [id]
  );

  if (employee.rows.length === 0) {
    return null;
  }

  return employee.rows[0].score;
}

const getSender = async (id) => {
  const sender = await client.query(
    `
    SELECT 
      score,
      last_transfer_at
    FROM 
      employees
    WHERE 
      id = $1
    `,
    [id]
  );

  if (sender.rows.length === 0) {
    return null;
  }

  return sender.rows[0];
}

const stillCooldown = (last_transfer_at) => {
  if (!last_transfer_at) {
    return false;
  }

  const cooldown = 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(last_transfer_at).getTime();

  return elapsed < cooldown;
}

const recipientExists = async (id) => {
  const recipient = await client.query(
    `
    SELECT 
      id
    FROM 
      employees
    WHERE 
      id = $1
    `,
    [id]
  );

  return recipient.rows.length > 0;
}

const transfer = async (senderId, recipientId, amount) => {
  const sender = await client.query(
    `
    UPDATE 
      employees
    SET 
      score = score - $1,
      last_transfer_at = NOW()
    WHERE 
      id = $2
    RETURNING score
    `,
    [
      amount,
      senderId
    ]
  );

  await client.query(
    `
    UPDATE 
      employees
    SET 
      score = score + $1
    WHERE 
      id = $2
    `,
    [
      amount,
      recipientId
    ]
  );

  return sender.rows[0].score;
}

export {
  getScore,
  getSender,
  stillCooldown,
  recipientExists,
  transfer,
};
