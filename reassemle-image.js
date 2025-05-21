const fs = require('fs');

const reassembledInputFile = 'reassembled_file_content.bin';
const outputPngFile = 'top_secret.png';

// Object to store chunks sorted by index
const collectedImageChunks = {};
let totalChunksFound = 0;

try {
	const rawData = fs.readFileSync(reassembledInputFile);
	console.log(`Reading reassembled binary file: ${reassembledInputFile}. Size: ${rawData.length} bytes`);

	// Search for each occurrence of {"chunk":
	const chunkStartPattern = Buffer.from('{"chunk":', 'utf8');

	let offset = 0;
	while (offset < rawData.length) {
		const startIndex = rawData.indexOf(chunkStartPattern, offset);

		if (startIndex === -1) {
			break; // No more chunks found
		}

		// Find the end of the JSON object
		let jsonEndIndex = -1;
		let braceCount = 0;
		for (let i = startIndex; i < rawData.length; i++) {
			const char = rawData[i];
			if (char === 0x7b) { // '{'
				braceCount++;
			} else if (char === 0x7d) { // '}'
				braceCount--;
				if (braceCount === 0) {
					jsonEndIndex = i;
					break;
				}
			}
		}

		if (jsonEndIndex === -1) {
			console.warn(`Warning: Found chunk start but couldn't find matching '}' from offset ${startIndex}.`);
			break;
		}

		const jsonString = rawData.toString('utf8', startIndex, jsonEndIndex + 1);

		try {
			const chunkObject = JSON.parse(jsonString);
			totalChunksFound++;

			if (chunkObject && chunkObject.chunk && chunkObject.chunk.data && chunkObject.chunk.ix !== undefined) {
				const base64Data = chunkObject.chunk.data;
				const index = chunkObject.chunk.ix;
				const id = chunkObject.chunk.id;

				// Decode data
				const binaryData = Buffer.from(base64Data, 'base64');

				console.log(`Found chunk ${index} (ID: ${id}) with ${binaryData.length} bytes of data`);
				collectedImageChunks[index] = binaryData;
			} else {
				console.warn(`Warning: Found JSON object but couldn't extract chunk data or index: ${jsonString.substring(0, 100)}...`);
			}
		} catch (jsonErr) {
			console.warn(`Warning: Could not parse JSON from offset ${startIndex}: ${jsonString.substring(0, 100)}... Error: ${jsonErr.message}`);
		}

		offset = jsonEndIndex + 1; // Continue search for next chunk
	}

	console.log(`Found total of ${totalChunksFound} chunks, ${Object.keys(collectedImageChunks).length} with valid data.`);
	console.log('Finished extracting all data chunks. Starting to sort and combine...');

	// Sort chunks based on their index
	const sortedIndices = Object.keys(collectedImageChunks).map(Number).sort((a, b) => a - b);
	console.log(`Sorted indices: ${sortedIndices.join(', ')}`);

	let finalImageData = Buffer.alloc(0);

	for (const index of sortedIndices) {
		const chunk = collectedImageChunks[index];
		finalImageData = Buffer.concat([finalImageData, chunk]);
	}

	if (finalImageData.length > 0) {
		fs.writeFileSync(outputPngFile, finalImageData);
		console.log(`Image successfully reassembled and saved to: ${outputPngFile}`);
		console.log(`Total image size: ${finalImageData.length} bytes.`);

		// Check if data starts with a PNG signature (89 50 4E 47)
		if (finalImageData.length >= 8) {
			const signature = finalImageData.slice(0, 8).toString('hex');
			console.log(`First 8 bytes of image: ${signature}`);
			if (signature.startsWith('89504e47')) {
				console.log('Valid PNG signature detected!');
			} else {
				console.log('Warning: PNG signature not found at start of data.');
			}
		}
	} else {
		console.log('No image data found to reassemble.');
	}

} catch (err) {
	console.error(`An error occurred: ${err.message}`);
}