import { promises as fs } from "fs";
import path from "path";

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // In production, this should be hashed
  phoneNumber: string;
  address: string;
  country: string;
  dateOfBirth: string;
}

const USERS_DB_PATH = path.join(process.cwd(), ".data", "users.json");

// Ensure .data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.dirname(USERS_DB_PATH), { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Initialize with demo user if database doesn't exist
async function initializeDemoUser() {
  await ensureDataDir();
  try {
    await fs.access(USERS_DB_PATH);
  } catch {
    // File doesn't exist, create it with demo user
    const demoUsers: User[] = [
      {
        username: "trip",
        email: "demo@travel-planner.com",
        firstName: "Demo",
        lastName: "User",
        password: "planner", // Demo credentials
        phoneNumber: "1234567890",
        address: "123 Travel Street",
        country: "United States",
        dateOfBirth: "1990-01-01",
      },
    ];
    await fs.writeFile(USERS_DB_PATH, JSON.stringify(demoUsers, null, 2));
  }
}

// Read all users
async function getAllUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USERS_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet
    return [];
  }
}

// Write users to file
async function saveUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

// Find user by username
export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Create new user
export async function createUser(userData: User): Promise<User> {
  await initializeDemoUser();
  
  // Check if user already exists
  const existingUser = await findUserByUsername(userData.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const existingEmail = await findUserByEmail(userData.email);
  if (existingEmail) {
    throw new Error("Email already registered");
  }

  const users = await getAllUsers();
  users.push(userData);
  await saveUsers(users);

  return userData;
}

// Verify user credentials
export async function verifyUser(
  username: string,
  password: string
): Promise<User | null> {
  await initializeDemoUser();
  
  const user = await findUserByUsername(username);
  if (!user) return null;

  // In production, use bcrypt or similar
  if (user.password === password) {
    return user;
  }

  return null;
}

// Get user without password
export function sanitizeUser(user: User): Omit<User, "password"> {
  const { password, ...safeUser } = user;
  return safeUser;
}
