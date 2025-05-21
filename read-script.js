const PcapParser = require('pcap-parser');
const path = require('path');

const inputFile = 'json-data.pcap';

const parser = PcapParser.parse(inputFile);

console.log(`Start read ${inputFile}...`);

parser.on('packet', function (packet) {
	const ipHeaderLength = (packet.data[0] & 0x0F) * 4;
	const ipFlagsAndOffset = packet.data.readUInt16BE(6);

	const moreFragments = ((ipFlagsAndOffset & 0x2000) >> 13) === 1;
	const fragmentOffset = (ipFlagsAndOffset & 0x1FFF) * 8;

	if (moreFragments || (moreFragments === false && fragmentOffset !== 0)) {
		const ipPayload = packet.data.slice(ipHeaderLength);

		console.log(`Packet NR ${packet.header.packetNumber}, IP ID: ${packet.data.readUInt16BE(4)} ` +
			`Offset: ${fragmentOffset} (${ipPayload.length} bytes payload):`);
		console.log(ipPayload.toString('utf8').substring(0, 50));
		console.log('---');
	}

});

parser.on('end', function () {
	console.log('Done reading pcap.');
});

parser.on('error', function (err) {
	console.error('Error parsing pcap', err);
});