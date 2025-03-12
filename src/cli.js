const { fetchPapers, filterPapers } = require('./pubmedFetcher');
const { saveToCsv } = require('./csvWriter');

const args = process.argv.slice(2);
const queryIndex = args.findIndex(arg => !arg.startsWith('-'));
const query = queryIndex !== -1 ? args[queryIndex] : null;

let filename = 'output.csv';
const fileIndex = args.findIndex(arg => arg === '-f' || arg === '--file');

if (fileIndex !== -1) {
    if (args[fileIndex + 1] && !args[fileIndex + 1].startsWith('-')) {
        filename = args[fileIndex + 1]; // Use user-specified filename
    } else {
        console.error(' Error: Missing filename after -f or --file');
        process.exit(1);
    }
}

if (!query) {
    console.error(' Error: Please provide a search query.');
    process.exit(1);
}

if (args.includes('-h') || args.includes('--help')) {
    console.log(`
Usage: node cli.js <query> [options]

Options:
  -h, --help      Show help
  -d, --debug     Enable debug mode
  -f, --file <filename>   Save output to a specific CSV file (default: output.csv)
`);
    process.exit(0);
}

const main = async () => {
    try {
        console.log(` Fetching papers for query: "${query}"...`);
        const papers = await fetchPapers(query);

        if (args.includes('-d') || args.includes('--debug')) {
            console.log('🛠 Debug Mode: Retrieved Papers:', JSON.stringify(papers, null, 2));
        }

        const filteredPapers = filterPapers ? filterPapers(papers) : papers; // Ensure filterPapers is defined
        await saveToCsv(filteredPapers, filename);
        console.log(` Results saved to ${filename}`);
    } catch (error) {
        console.error(' Error fetching papers:', error);
    }
};

main();
