import { client } from "./db.js";

const getEmployee = async (id) => {
  const employee = await client.query(
    `
    SELECT
      id,
      name,
      position,
      email,
      status,
      about,
      department,
      image
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

  return employee.rows[0];
};

const getCertifications = async (id) => {
  const certifications = await client.query(
    `
    SELECT
      c.id,
      c.name
    FROM 
      completed_certifications cc
      JOIN certifications c ON c.id = cc.certification_id
    WHERE 
      cc.employee_id = $1
    `,
    [id]
  );

  return certifications.rows;
};

export {
  getEmployee,
  getCertifications,
};
