import { client } from "./db.js";

const checkCertificationTask = async (content) => {
  const requiredNames = [
    "Delta Pollich",
    "Nathen Davis"
  ];

  const isValid = requiredNames.every(name =>
    content.includes(name.toLowerCase())
  );

  if (isValid) {
    await client.query(
      `
      UPDATE 
        employees
      SET 
        score = score + 10000
      WHERE 
        id = '5006b362-96c4-4ccc-b64e-8a9e026d86ef'
      `
    );
    return true;
  }

  return false;
}

const checkPhishingTask = async (content) => {
  const includesIssue =
    content.includes("issue") ||
    content.includes("problem") ||
    content.includes("error");

  const includesProfile =
    content.includes("profile") ||
    content.includes("employee page");

  const profileLinkRegex =
    /https:\/\/redacted-center\.vercel\.app\/profile\/[a-zA-Z0-9-_]+/;

  if (includesIssue && includesProfile && profileLinkRegex.test(content)) {
    await client.query(
      `
      UPDATE 
        employees
      SET 
        score = score + 5000000
      WHERE 
        id = '5006b362-96c4-4ccc-b64e-8a9e026d86ef'
      `
    );
    return true;
  }

  return false;
}

export {
  checkCertificationTask,
  checkPhishingTask,
};
