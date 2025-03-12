const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const { Parser } = require('json2csv');

const BASE_DELAY = 500; 
const MAX_RETRIES = 5; 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch PMIDs for a given query
const fetchPMIDs = async (query) => {
    try {
        await sleep(1000); 
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json`;
        const response = await axios.get(searchUrl);
        return response.data.esearchresult.idlist || [];
    } catch (error) {
        await sleep(1000);
        console.error("Error fetching PMIDs:", error.message);
        return [];
    }
};

// Function to check if an author is non-academic
const isNonAcademic = (affiliation) => {
    console.log(`Checking affiliation: "${affiliation}"`);

    if (!affiliation || affiliation.trim().toLowerCase() === "unknown") {  
        console.log(`Result for "${affiliation}": false (academic)`);
        return false;  
    }

    const lowerAff = affiliation.toLowerCase();
    const companyKeywords = ["pharmaceutical", "biotech", "corporation", "inc", "ltd", "gmbh"];

    if (companyKeywords.some(word => lowerAff.includes(word))) {
        console.log(`Result for "${affiliation}": true (non-academic)`);
        return true; 
    }
    
    if (lowerAff.includes("university") || lowerAff.includes("hospital") || lowerAff.includes("institute")) {
        console.log(`Result for "${affiliation}": false (academic)`);
        return false;
    }

    console.log(`Default result for "${affiliation}": true (non-academic)`);
    return true;
};

const fetchPaperDetails = async (pmid) => {
    let attempt = 0;
    let delay = BASE_DELAY;

    while (attempt < MAX_RETRIES) {
        try {
            const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
            const response = await axios.get(detailsUrl);
            const parser = new xml2js.Parser({ explicitArray: false });
            const result = await parser.parseStringPromise(response.data);

            if (!result?.PubmedArticleSet?.PubmedArticle) return null;

            const article = result.PubmedArticleSet.PubmedArticle.MedlineCitation;
            const title = article?.Article?.ArticleTitle || "Unknown Title";
            const pubDate = article?.Article?.Journal?.JournalIssue?.PubDate?.Year || "Unknown Date";
            const authors = article?.Article?.AuthorList?.Author || [];

            
            const authorArray = Array.isArray(authors) ? authors : [authors];

            
            const nonAcademicAuthors = authorArray.filter(author => isNonAcademic(author?.AffiliationInfo?.Affiliation || ""));

            return {
                PubmedID: pmid,
                Title: title,
                "Publication Date": pubDate,
                "Non-academic Author(s)": nonAcademicAuthors.map(a => `${a.LastName} ${a.ForeName}`).join(", "),
                "Company Affiliation(s)": nonAcademicAuthors.map(a => a.AffiliationInfo?.Affiliation || "").join(", "),
                "Corresponding Author Email": "" 
            };
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.warn(`⚠️ Rate limit hit for PMID ${pmid}. Retrying in ${delay / 1000}s...`);
                await sleep(delay);
                delay *= 2;
                attempt++;
            } else {
                console.error(`Error fetching details for PMID ${pmid}:`, error.message);
                return null;
            }
        }
    }

    console.error(`Failed to fetch details for PMID ${pmid} after ${MAX_RETRIES} retries.`);
    return null;
};

const fetchPapers = async (query) => {
    const pmids = await fetchPMIDs(query);
    console.log(`Fetched PMIDs:`, pmids);

    const paperDetails = [];
    for (const pmid of pmids) {
        const paper = await fetchPaperDetails(pmid);
        if (paper) {
            console.log(`Processing Paper: ${pmid} Title: ${paper.Title}`);
            paperDetails.push(paper);
        }
    }

    console.log(`Final Filtered Papers Count: ${paperDetails.length}`);
    return paperDetails;
};


const saveToCSV = (data, filename) => {
    if (data.length === 0) {
        console.log("No data to save.");
        return;
    }

    try {
        const parser = new Parser();
        const csv = parser.parse(data);
        fs.writeFileSync(filename, csv);
        console.log(` Results saved to ${filename}`);
    } catch (error) {
        console.error("Error saving to CSV:", error.message);
    }
};


const main = async () => {
    if (process.env.JEST_WORKER_ID !== undefined) {
        return; 
    }

    const query = process.argv[2];
    const outputFile = process.argv[4];

    if (!query || !outputFile) {
        console.log("Usage: node index.js <query> -f <output_file>");
        return;
    }

    console.log(`🔍 Fetching papers for query: "${query}"...`);
    const papers = await fetchPapers(query);
    saveToCSV(papers, outputFile);
};


module.exports = { fetchPMIDs, fetchPaperDetails, fetchPapers, saveToCSV, isNonAcademic };
if (require.main === module) {
    main();
}
