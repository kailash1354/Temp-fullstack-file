#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) =>
    console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`),
};

const projectRoot = process.cwd();
const backendDir = path.join(projectRoot, "backend");
const frontendDir = path.join(projectRoot, "frontend");

async function checkPrerequisites() {
  log.step("Checking Prerequisites...");

  try {
    // Check Node.js
    const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim();
    const nodeMajor = parseInt(nodeVersion.substring(1).split(".")[0]);

    if (nodeMajor < 16) {
      log.error(
        `Node.js version ${nodeVersion} is too old. Please upgrade to Node.js 16 or higher.`
      );
      process.exit(1);
    }
    log.success(`Node.js ${nodeVersion} detected`);

    // Check npm
    const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
    log.success(`npm ${npmVersion} detected`);

    // Check Git
    try {
      const gitVersion = execSync("git --version", { encoding: "utf8" }).trim();
      log.success(gitVersion);
    } catch (error) {
      log.warning("Git not found. Some features may not work properly.");
    }
  } catch (error) {
    log.error("Failed to check prerequisites:", error.message);
    process.exit(1);
  }
}

async function setupBackend() {
  log.step("Setting up Backend...");

  if (!fs.existsSync(backendDir)) {
    log.error(
      "Backend directory not found. Please ensure the project structure is complete."
    );
    process.exit(1);
  }

  try {
    process.chdir(backendDir);

    // Install dependencies
    log.info("Installing backend dependencies...");
    execSync("npm install", { stdio: "inherit" });
    log.success("Backend dependencies installed");

    // Create .env file if it doesn't exist
    const envPath = path.join(backendDir, ".env");
    const envExamplePath = path.join(backendDir, ".env.example");

    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log.success("Created .env file from .env.example");
      log.warning(
        "Please update the .env file with your actual configuration values"
      );
    } else if (fs.existsSync(envPath)) {
      log.success(".env file already exists");
    }

    process.chdir(projectRoot);
  } catch (error) {
    log.error("Failed to setup backend:", error.message);
    process.exit(1);
  }
}

async function setupFrontend() {
  log.step("Setting up Frontend...");

  if (!fs.existsSync(frontendDir)) {
    log.error(
      "Frontend directory not found. Please ensure the project structure is complete."
    );
    process.exit(1);
  }

  try {
    process.chdir(frontendDir);

    // Install dependencies
    log.info("Installing frontend dependencies...");
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
    log.success("Frontend dependencies installed");

    // Create .env file if it doesn't exist
    const envPath = path.join(frontendDir, ".env");

    if (!fs.existsSync(envPath)) {
      const envContent = "VITE_API_URL=http://localhost:5000/api\n";
      fs.writeFileSync(envPath, envContent);
      log.success("Created .env file for frontend");
    } else {
      log.success(".env file already exists");
    }

    process.chdir(projectRoot);
  } catch (error) {
    log.error("Failed to setup frontend:", error.message);
    process.exit(1);
  }
}

async function createDirectories() {
  log.step("Creating necessary directories...");

  const directories = [
    path.join(backendDir, "logs"),
    path.join(backendDir, "uploads"),
    path.join(backendDir, "temp"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log.success(`Created directory: ${path.relative(projectRoot, dir)}`);
    }
  });
}

async function displayNextSteps() {
  log.step("Setup Complete! Next Steps:");

  console.log(
    `\n${colors.bright}1. Configure Environment Variables:${colors.reset}`
  );
  console.log("   - Edit backend/.env with your actual values");
  console.log("   - Set up MongoDB Atlas database");
  console.log("   - Configure Cloudinary for image uploads");
  console.log("   - Set up email service (SendGrid or Ethereal)");

  console.log(
    `\n${colors.bright}2. Start the Development Servers:${colors.reset}`
  );
  console.log("   - Terminal 1: cd backend && npm run dev");
  console.log("   - Terminal 2: cd frontend && npm run dev");

  console.log(`\n${colors.bright}3. Access the Application:${colors.reset}`);
  console.log("   - Frontend: http://localhost:5173");
  console.log("   - Backend API: http://localhost:5000");
  console.log("   - API Health Check: http://localhost:5000/api/health");

  console.log(`\n${colors.bright}4. Default Admin Account:${colors.reset}`);
  console.log("   - Create an account through the registration form");
  console.log('   - Manually set the user role to "admin" in the database');
  console.log("   - Access admin panel at: http://localhost:5173/admin");

  console.log(`\n${colors.bright}5. Additional Configuration:${colors.reset}`);
  console.log("   - Configure Stripe for payments");
  console.log("   - Set up Redis for caching (optional)");
  console.log("   - Configure production environment variables");

  console.log(
    `\n${colors.green}✨ Your Luxe Heritage e-commerce platform is ready!${colors.reset}\n`
  );
}

async function main() {
  console.log(
    `\n${colors.bright}${colors.magenta}🏪 Luxe Heritage E-Commerce Platform Setup${colors.reset}\n`
  );

  try {
    await checkPrerequisites();
    await setupBackend();
    await setupFrontend();
    await createDirectories();
    await displayNextSteps();
  } catch (error) {
    log.error("Setup failed:", error.message);
    process.exit(1);
  }
}

main();
