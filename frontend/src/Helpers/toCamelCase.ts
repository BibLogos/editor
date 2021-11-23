export function toCamelCase(sentenceCase: string) {
	let STR = sentenceCase.replaceAll('  ', ' ').toLowerCase()
		.trim()
		.split(/[ -_]/g)
		.map(word => word.replace(word?.[0], word[0]?.toString().toUpperCase()))
		.join('');
	return STR
};