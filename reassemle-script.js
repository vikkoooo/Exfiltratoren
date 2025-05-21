const PcapParser = require('pcap-parser');
const fs = require('fs');
const path = require('path');

const inputFile = 'json-data.pcap';
const outputFile = 'reassembled_file_content.bin';

const ipFragments = {};

function reassembleIpDatagram(id) {
	const fragments = ipFragments[id];

	fragments.sort((a, b) => a.fragmentOffset - b.fragmentOffset);

	let reassembledBuffer = Buffer.alloc(0);
	let currentOffset = 0;

	for (const fragment of fragments) {
		if (fragment.fragmentOffset > currentOffset) {
			console.warn(`Warning: Gap detected in fragment ID ${id}. Expected offset ${currentOffset}, got ${fragment.fragmentOffset}.`);
			const gap = Buffer.alloc(fragment.fragmentOffset - currentOffset);
			reassembledBuffer = Buffer.concat([reassembledBuffer, gap]);
		} else if (fragment.fragmentOffset < currentOffset) {
			console.warn(`Warning: Overlap detected in fragment ID ${id}. Expected offset ${currentOffset}, got ${fragment.fragmentOffset}.`);
			reassembledBuffer = reassembledBuffer.slice(0, fragment.fragmentOffset);
		}

		reassembledBuffer = Buffer.concat([reassembledBuffer, fragment.payload]);
		currentOffset = fragment.fragmentOffset + fragment.payload.length;
	}

	delete ipFragments[id];
	return reassembledBuffer;
}

const parser = PcapParser.parse(inputFile);

parser.on('packet', function (packet) {
	const ipHeaderStart = 14;

	if (packet.data.length >= ipHeaderStart + 20 && packet.data.readUInt16BE(12) === 0x0800) {
		if ((packet.data[ipHeaderStart] & 0xF0) === 0x40) {
			const ipHeaderLength = (packet.data[ipHeaderStart] & 0x0F) * 4;
			const ipId = packet.data.readUInt16BE(ipHeaderStart + 4);
			const ipFlagsAndOffset = packet.data.readUInt16BE(ipHeaderStart + 6);

			const moreFragments = (ipFlagsAndOffset & 0x2000) !== 0;
			const fragmentOffset = (ipFlagsAndOffset & 0x1FFF) * 8;

			if (moreFragments || fragmentOffset !== 0) {
				const ipPayload = packet.data.slice(ipHeaderStart + ipHeaderLength);

				if (!ipFragments[ipId]) {
					ipFragments[ipId] = [];
				}

				ipFragments[ipId].push({
					payload: ipPayload,
					fragmentOffset: fragmentOffset,
					moreFragments: moreFragments
				});
			}
		}
	} else if (packet.data.length >= 20 && (packet.data[0] & 0xF0) === 0x40) {
		const ipHeaderLength = (packet.data[0] & 0x0F) * 4;
		const ipId = packet.data.readUInt16BE(4);
		const ipFlagsAndOffset = packet.data.readUInt16BE(6);

		const moreFragments = (ipFlagsAndOffset & 0x2000) !== 0;
		const fragmentOffset = (ipFlagsAndOffset & 0x1FFF) * 8;

		if (moreFragments || fragmentOffset !== 0) {
			const ipPayload = packet.data.slice(ipHeaderLength);

			if (!ipFragments[ipId]) {
				ipFragments[ipId] = [];
			}

			ipFragments[ipId].push({
				payload: ipPayload,
				fragmentOffset: fragmentOffset,
				moreFragments: moreFragments
			});
		}
	}
});

parser.on('end', async function () {
	console.log('Finished reading pcap file. Starting reassembly...');

	let totalReassembledData = Buffer.alloc(0);
	let reassembledCount = 0;

	for (const id in ipFragments) {
		console.log(`Reassembling IP datagram ID: ${id} with ${ipFragments[id].length} fragments.`);
		const reassembledData = reassembleIpDatagram(id);
		totalReassembledData = Buffer.concat([totalReassembledData, reassembledData]);
		reassembledCount++;
	}

	if (totalReassembledData.length > 0) {
		try {
			fs.writeFileSync(outputFile, totalReassembledData);
			console.log(`Successfully reassembled ${reassembledCount} IP datagrams and saved ${totalReassembledData.length} bytes to: ${outputFile}`);

			console.log('\n--- First 500 characters of reassembled data (interpreted as UTF-8) ---');
			console.log(totalReassembledData.toString('utf8').substring(0, 500));
			console.log('------------------------------------------------------------------');

		} catch (err) {
			console.error(`Error saving reassembled data: ${err}`);
		}
	} else {
		console.log('No fragmented data found to reassemble.');
	}
});

parser.on('error', function (err) {
	console.error('An error occurred while parsing the pcap file:', err);
});