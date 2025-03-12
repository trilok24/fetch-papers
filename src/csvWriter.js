const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const saveToCsv = async (papers, filename) => {
    // Ensure unique affiliations for each paper
    const processedPapers = papers.map(paper => ({
        PubmedID: paper.PubmedID,
        Title: paper.Title,
        "Publication Date": paper["Publication Date"],
        "Non-academic Author(s)": paper["Non-academic Author(s)"],
        "Company Affiliation(s)": [...new Set(paper["Company Affiliation(s)"].split("; "))].join("; "), // Remove duplicates
        "Corresponding Author Email": paper["Corresponding Author Email"]
    }));

    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            { id: 'PubmedID', title: 'PubmedID' },
            { id: 'Title', title: 'Title' },
            { id: 'Publication Date', title: 'Publication Date' },
            { id: 'Non-academic Author(s)', title: 'Non-academic Author(s)' },
            { id: 'Company Affiliation(s)', title: 'Company Affiliation(s)' },
            { id: 'Corresponding Author Email', title: 'Corresponding Author Email' }
        ]
    });

    await csvWriter.writeRecords(processedPapers);
};

module.exports = { saveToCsv };
