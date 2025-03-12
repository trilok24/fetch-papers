const fs = require('fs');
const { saveToCsv } = require('./src/csvWriter'); 



const testPapers = [
    {
        PubmedID: "123456",
        Title: "Test Paper on AI",
        "Publication Date": "2025",
        "Non-academic Author(s)": "John Doe, Jane Smith",
        "Company Affiliation(s)": "Tech Corp; AI Labs; Tech Corp",
        "Corresponding Author Email": "johndoe@example.com"
    }
];

const filename = "test_output.csv";

(async () => {
    await saveToCsv(testPapers, filename);

    if (fs.existsSync(filename)) {
        console.log(" CSV file was created successfully!");

        // Read the content for verification
        const content = fs.readFileSync(filename, 'utf8');
        console.log("\n CSV Content:\n", content);
    } else {
        console.log(" CSV file was NOT created.");
    }
})();
