const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Peer Review System...\n');

try {
  // Check if Node.js is installed
  console.log('📦 Checking Node.js installation...');
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);

  // Check if npm is installed
  console.log('📦 Checking npm installation...');
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm version: ${npmVersion}`);

  // Install root dependencies
  console.log('\n📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install server dependencies
  console.log('\n📦 Installing server dependencies...');
  process.chdir('server');
  execSync('npm install', { stdio: 'inherit' });

  // Install client dependencies
  console.log('\n📦 Installing client dependencies...');
  process.chdir('../client');
  execSync('npm install', { stdio: 'inherit' });

  // Create uploads directory
  console.log('\n📁 Creating uploads directory...');
  const uploadsDir = path.join(__dirname, 'server', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
  } else {
    console.log('✅ Uploads directory already exists');
  }

  // Create .env file if it doesn't exist
  console.log('\n⚙️ Setting up environment...');
  const envPath = path.join(__dirname, 'server', '.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-peer-review
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file created');
  } else {
    console.log('✅ Environment file already exists');
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Make sure MongoDB is running on your system');
  console.log('2. Run: npm run dev');
  console.log('3. Open http://localhost:3000 in your browser');
  console.log('\n💡 If you encounter issues:');
  console.log('- Check that MongoDB is running');
  console.log('- Verify all dependencies are installed');
  console.log('- Check the console for error messages');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('- Make sure Node.js and npm are installed');
  console.log('- Check your internet connection');
  console.log('- Try running the commands manually');
}

