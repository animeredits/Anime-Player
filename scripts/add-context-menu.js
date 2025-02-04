const fs = require('fs');
const path = require('path');
const os = require('os');
const regedit = require('regedit');

module.exports = async function(context) {
	const appPath = context.appOutDir;
	const isWin = os.platform() === 'win32';
	const iconPath = path.join(appPath, '../assets/icons/icon.ico');
	if (isWin) {
		const registryKey = 'HKEY_CLASSES_ROOT\\*\\shell\\Open with Anime Player';
		const command = `"${appPath}\\Anime Player.exe" "%1"`;

		try {
			// Create registry entry
			regedit.createKey(registryKey, function(err) {
				if (err) {
					console.error('Error creating registry key:', err);
					return;
				}
				regedit.putValue({
						[registryKey]: {
							'command': {
								value: command,
								type: 'REG_SZ',
							},
							'icon': {
								value: iconPath,
								type: 'REG_SZ',
							},
						},
					},
					function(err) {
						if (err) {
							console.error('Error adding registry value:', err);
						}
					}
				);
			});
		} catch (err) {
			console.error('Error modifying registry:', err);
		}
	}
};