const { execSync } = require('child_process');

try {
  console.log('Installing dependencies...');
  execSync('npm install --yes', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}
