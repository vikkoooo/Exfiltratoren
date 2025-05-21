const fs = require('fs');

const inputFile = 'reassembled_file_content.bin';

try {
	const data = fs.readFileSync(inputFile);

	console.log(`File size: ${data.length} bytes`);
	console.log('\n--- First 100 bytes (hexadecimal) ---');
	console.log(data.slice(0, 100).toString('hex'));

	console.log('\n--- First 500 bytes (attempted as UTF-8 text) ---');
	console.log(data.toString('utf8', 0, 500));

} catch (err) {
	console.error(`Error reading file: ${err.message}`);
}