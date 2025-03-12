
# fetch-papers

# Fetch Papers

## 📌 Project Overview
The **Fetch Papers** project is a Node.js-based CLI tool designed to fetch research papers from PubMed based on user-specified queries. It filters papers that include at least one author affiliated with a pharmaceutical or biotech company and outputs the results in CSV format for further analysis.

## 🔥 Features
- Fetches research papers from PubMed via the **NCBI API**.
- Filters papers to include only those with non-academic authors affiliated with companies.
- Outputs the results in a **structured CSV format**.
- Includes **command-line options** for dynamic query input.
- Implements **error handling** for API failures and data inconsistencies.
- **Modular structure** with separate files for API handling, data processing, and CSV writing.
- **Unit tests** to ensure reliability and correctness.

## 📂 Project Structure
```
fetch-papers/
│-- src/
│   │-- fetchPapers.js        # Handles PubMed API requests
│   │-- filterPapers.js       # Filters papers based on author affiliations
│   │-- csvWriter.js          # Writes output to CSV
│-- index.js                  # Main CLI script
│-- index.test.js             # Unit tests for main logic
│-- csvWriter.test.js         # Unit tests for CSV writing
│-- package.json              # Project dependencies and scripts
│-- README.md                 # Project documentation
│-- .env                      # Environment variables (API keys, etc.)
```

## 🛠 Installation
### Prerequisites:
- **Node.js** (v18 or later recommended)
- **Yarn or npm** (for package management)

### Steps:
1. **Clone the repository:**
   ```sh
   git clone https://github.com/trilok24/fetch-papers.git
   cd fetch-papers
   ```
2. **Install dependencies:**
   ```sh
   yarn install
   ```
   or using npm:
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file and add your PubMed API key (if needed):
     ```sh
     PUBMED_API_KEY= " "
     ```

## 🚀 Usage
Run the script with a keyword to fetch relevant research papers:
```sh
node index.js --query "cancer treatment"
```
This will fetch papers related to "cancer treatment," filter them, and save the results in `output.csv`.

### Command-line Options:
| Option | Description |
|--------|-------------|
| `--query` | Search keyword for PubMed (Required) |
| `--output` | Specify output CSV filename (Default: `output.csv`) |
| `--limit` | Number of papers to fetch (Default: 100) |

Example:
```sh
node index.js --query "Alzheimer's disease" --output alzheimer_papers.csv --limit 50
```

## Running Tests
To ensure the correctness of the script, run the unit tests:
```sh
yarn test
```

```

## 🏗 Future Improvements
- Add **GUI interface** for easier user interaction.
- Implement **machine learning** to classify research papers.
- Support **multiple output formats** (JSON, Excel, PDF).

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📜 License
This project is open-source and available under the **MIT License**.

---
📧 **Author:** Trilok Mandre  
🔗 **GitHub:** [trilok24](https://github.com/trilok24)  
🔗 **LinkedIn:** [Trilok Mandre](https://www.linkedin.com/in/trilok-mandre-4a0a47209)

a2c395b (Initial commit - Added Fetch Papers project)
