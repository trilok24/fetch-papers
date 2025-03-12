require("dotenv").config();
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const { parse } = require("json2csv");

const API_KEY = process.env.PUBMED_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

const args = process.argv.slice(2);
const options = {
    help: args.includes("-h") || args.includes("--help"),
    debug: args.includes("-d") || args.includes("--debug"),
    file: null,
    query: null
};

const fileIndex = args.findIndex(arg => arg === "-f" || arg === "--file");
if (fileIndex !== -1 && fileIndex + 1 < args.length) {
    options.file = args[fileIndex + 1];
}

const queryIndex = args.findIndex(arg => !arg.startsWith("-"));
if (queryIndex !== -1) {
    options.query = args[queryIndex];
}

if (options.help || !options.query) {
    console.log("Usage: node index.js <query> [-f <output.csv>] [-d]");
    console.log("\nOptions:");
    console.log("  -h, --help    Show help information");
    console.log("  -d, --debug   Enable debug mode");
    console.log("  -f, --file    Specify output file (otherwise prints to console)");
    // process.exit(0);
    if (require.main === module) process.exit(0);

}

if (options.debug) {
    console.log("Debug Mode Enabled");
    console.log("Query:", options.query);
    console.log("Output File:", options.file || "None (printing to console)");
}

const fetchPMIDs = async (query) => {
    try {
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}[Title]&retmode=json&api_key=${API_KEY}`;
        const response = await axios.get(searchUrl);
        const pmids = response.data.esearchresult.idlist || [];
        if (options.debug) console.log("Fetched PMIDs:", pmids);
        return pmids;
    } catch (error) {
        console.error("Error fetching PMIDs:", error.message);
        return [];
    }
};

const fetchPaperDetails = async (pmid, attempt = 1) => {
    try {
        const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&api_key=${API_KEY}`;
        const response = await axios.get(detailsUrl);
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);
        
        if (!result?.PubmedArticleSet?.PubmedArticle) return null;

        const article = result.PubmedArticleSet.PubmedArticle.MedlineCitation;
        const title = article?.Article?.ArticleTitle || "Unknown Title";
        const pubDate = article?.Article?.Journal?.JournalIssue?.PubDate?.Year || "Unknown Date";
        const authors = article?.Article?.AuthorList?.Author || [];

        if (options.debug) console.log("Processing Paper:", pmid, "Title:", title);

        const nonAcademicAuthors = authors.filter(author => {
            const affiliation = author?.AffiliationInfo?.Affiliation || "";
            return isNonAcademic(affiliation);
        });

        return {
            PubmedID: pmid,
            Title: title,
            "Publication Date": pubDate,
            "Non-academic Author(s)": nonAcademicAuthors.map(a => `${a.LastName} ${a.ForeName}`).join(", "),
            "Company Affiliation(s)": nonAcademicAuthors.map(a => a.AffiliationInfo?.Affiliation || "").join(", "),
            "Corresponding Author Email": ""
        };
    } catch (error) {
        if (error.response && error.response.status === 429 && attempt <= MAX_RETRIES) {
            console.warn(`Rate limit exceeded for PMID ${pmid}, retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${attempt}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchPaperDetails(pmid, attempt + 1);
        }
        console.error(`Error fetching details for PMID ${pmid}:`, error.message);
        return null;
    }
};

const isNonAcademic = (affiliation) => {
    if (!affiliation || affiliation.trim().toLowerCase() === "unknown") {  
        return false;
    }

    const lowerAff = affiliation.toLowerCase();
    const companyKeywords = ["pharmaceutical", "biotech", "corporation", "inc", "ltd", "gmbh"];

    if (companyKeywords.some(word => lowerAff.includes(word))) {
        return true;
    }
    
    if (lowerAff.includes("university") || lowerAff.includes("hospital") || lowerAff.includes("institute")) {
        return false;
    }

    return false;
};

const fetchPapers = async () => {
    try {
        const pmids = await fetchPMIDs(options.query);
        if (pmids.length === 0) {
            console.log("No papers found for query:", options.query);
            return;
        }

        const paperDetails = await Promise.all(pmids.map(pmid => fetchPaperDetails(pmid)));
        const filteredPapers = paperDetails.filter(Boolean);

        if (options.debug) console.log("Final Filtered Papers Count:", filteredPapers.length);

        if (options.file) {
            saveToCSV(filteredPapers, options.file);
        } else {
            console.table(filteredPapers);
        }
    } catch (error) {
        console.error("Error fetching papers:", error.message);
    }
};

const saveToCSV = (data, filename) => {
    try {
        const fields = ["PubmedID", "Title", "Publication Date", "Non-academic Author(s)", "Company Affiliation(s)", "Corresponding Author Email"];
        const csv = parse(data, { fields });
        fs.writeFileSync(filename, csv);
        console.log(` Results saved to ${filename}`);
    } catch (error) {
        console.error("Error saving CSV:", error.message);
    }
};

// fetchPapers();
if (require.main === module) {
    fetchPapers();
}
module.exports = { isNonAcademic };
