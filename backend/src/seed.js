import "dotenv/config";
import { client } from "./db.js";
import { faker } from "@faker-js/faker";
import { createHash } from 'crypto';

const NUM_ACCOUNTS = 500;

const seedUsers = async () => {
  for (let i = 0; i < NUM_ACCOUNTS; i++) {
    await client.query(
      `
      INSERT INTO users
      (
        password,
        role
      )
      VALUES ($1, $2)
      `,
      [
        createHash('md5').update(faker.internet.password()).digest('hex'),
        i === 0 ? "admin" : "employee",
      ]
    );
  }
}

const firstNames = [
  "Adam",
  "Amelia",
  "Rob",
  "Alex",
  "Bob",
];

const statuses = [
  "Casual",
  "Full-time",
  "Part-time"
];

const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Legal",
  "Customer Support",
  "Product",
  "Security"
];

const createEmail = (name) => {
  const [firstName, lastName] = name.split(" ");
  return `${firstName[0]}${lastName}`
    .toLowerCase()
    .replace(/[^a-z]/g, "") + "@redacted.com";
}

const insertEmployee = async (id, name) => {
  await client.query(
    `
    INSERT INTO employees
    (
      id,
      name,
      position,
      email,
      status,
      about,
      department,
      image
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      id,
      name,
      faker.person.jobTitle(),
      createEmail(name),
      faker.helpers.arrayElement(statuses),
      faker.person.bio(),
      faker.helpers.arrayElement(departments),
      faker.image.avatarGitHub()
    ]
  );
}

const seedEmployees = async () => {
  const users = (
    await client.query(`
      SELECT 
        id
      FROM 
        users
    `)
  ).rows;

  for (let i = 0; i < users.length; i++) {
    if (i < firstNames.length) {
      await insertEmployee(users[i].id, `${firstNames[i]} ${faker.person.lastName()}`);
    } else {
      await insertEmployee(users[i].id, `${faker.person.firstName()} ${faker.person.lastName()}`);
    }
  }
}

const seedCertifications = async () => {
  const certifications = [
    { name: "Code of Conduct", valid_years: 2, required: true },
    { name: "Work Health & Safety", valid_years: 1, required: true },
    { name: "Privacy & Data Protection", valid_years: 2, required: true },
    { name: "Certified Associate in Project Management", valid_years: 5, required: false },
    { name: "Certified Business Analysis Professional", valid_years: 3, required: false },
    { name: "Meta Digital Marketing Associate", valid_years: 2, required: false },
    { name: "Meta Media Planning Professional", valid_years: 2, required: false },
    { name: "Professional in Human Resources", valid_years: 3, required: false },
    { name: "Cisco Certified Internetwork Expert", valid_years: 3, required: false },
    { name: "First Aid", valid_years: 3, required: false },
    { name: "CompTIA A+", valid_years: 3, required: false },
    { name: "Working with Children Check", valid_years: 5, required: false },
    { name: "Cloud Security Fundamentals", valid_years: 4, required: false },
  ];

  for (const certification of certifications) {
    await client.query(
      `
      INSERT INTO certifications
      (
        name,
        valid_years,
        required
      )
      VALUES ($1, $2, $3)
      `,
      [
        certification.name,
        certification.valid_years,
        certification.required
      ]
    );
  }
}

const seedCompletedCertifications = async () => {
  const employees = (
    await client.query(`
      SELECT 
        id
      FROM 
        employees
    `)
  ).rows;

  const certifications = (
    await client.query(`
      SELECT 
        id, required
      FROM 
        certifications
    `)
  ).rows;

  for (const employee of employees) {
    for (const certification of certifications) {
      const completed = certification.required
        ? Math.random() < 0.99
        : Math.random() < 0.15;

      if (!completed) continue;

      await client.query(
        `
        INSERT INTO completed_certifications
        (
          employee_id,
          certification_id,
          date_completed
        )
        VALUES ($1, $2, $3)
        `,
        [
          employee.id,
          certification.id,
          faker.date.past({ years: 5 }),
        ]
      );
    }
  }
};

const seed = async () => {
  await seedUsers();
  await seedEmployees();
  await seedCertifications();
  await seedCompletedCertifications();
};

seed()
  .catch(console.error)
  .finally(() => client.end());
