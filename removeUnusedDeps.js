const { exec } = require('child_process');
const depcheck = require('depcheck');

depcheck(process.cwd(), {}, (unused) => {
  const unusedDependencies = unused.dependencies;

  if (unusedDependencies.length > 0) {
    console.log('Unused dependencies found:', unusedDependencies);
    
    // Run npm uninstall for all unused dependencies
    const uninstallCommand = `npm uninstall ${unusedDependencies.join(' ')}`;
    exec(uninstallCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error uninstalling packages: ${stderr}`);
      } else {
        console.log(`Successfully uninstalled unused packages:\n${stdout}`);
      }
    });
  } else {
    console.log('No unused dependencies found.');
  }
});
