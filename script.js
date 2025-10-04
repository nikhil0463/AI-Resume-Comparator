document.addEventListener('DOMContentLoaded', () => {
    const addResumeBtn = document.getElementById('add-resume-btn');
    const resumesContainer = document.getElementById('resumes-container');
    const compareBtn = document.getElementById('compare-btn');
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    const apiKeyInput = document.getElementById('apiKey');

    let resumeCount = 0;

    const addResumeField = () => {
        resumeCount++;
        const resumeEntry = document.createElement('div');
        resumeEntry.classList.add('resume-entry');
        resumeEntry.innerHTML = `
            <div class="resume-header">
                <label for="resume${resumeCount}"><strong>Resume ${resumeCount}</strong></label>
                <button class="remove-resume-btn">Remove</button>
            </div>
            <textarea id="resume${resumeCount}" rows="12" placeholder="Paste resume ${resumeCount} content here..."></textarea>
        `;
        resumesContainer.appendChild(resumeEntry);

        resumeEntry.querySelector('.remove-resume-btn').addEventListener('click', () => {
            resumeEntry.remove();
        });
    };

    // Reverted to handle a plain text (Markdown) response instead of JSON
    const callGeminiAPI = async (prompt) => {
        const apiKey = apiKeyInput.value;
        if (!apiKey) {
            alert("Please enter your Google Gemini API Key.");
            return null;
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "contents": [{
                        "parts": [{ "text": prompt }]
                    }]
                    // generationConfig for JSON has been removed
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            // Directly return the text content, which should be Markdown
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            resultsDiv.innerHTML = `<p style="color: red;"><strong>Error:</strong> ${error.message}. Please check your API key and network connection.</p>`;
            return null;
        }
    };

    // Modified to build a single prompt for a comparative analysis
    const analyzeResumes = async () => {
        const jobDescription = document.getElementById('jobDescription').value;
        const resumeTextareas = resumesContainer.querySelectorAll('textarea');
        
        if (!jobDescription.trim()) {
            alert('Please paste the job description.');
            return;
        }

        if (resumeTextareas.length === 0) {
            alert('Please add at least one resume.');
            return;
        }

        let resumesData = [];
        let allResumesValid = true;
        resumeTextareas.forEach((textarea, index) => {
            if (!textarea.value.trim()) {
                alert(`Resume ${index + 1} is empty.`);
                allResumesValid = false;
            }
            resumesData.push({
                id: index + 1,
                content: textarea.value
            });
        });

        if (!allResumesValid) return;

        loader.style.display = 'block';
        resultsDiv.innerHTML = '';

        // Dynamically create the column headers for the prompt based on the number of resumes
        const resumeColumns = resumesData.map(r => `Resume ${r.id}`).join(' | ');

        // *** NEW PROMPT BASED ON THE UPLOADED IMAGE ***
        let prompt = `
You are an expert ATS (Applicant Tracking System) and a senior technical recruiter. Your task is to generate a comparative analysis of several resumes against a single job description, formatted exactly like the user's template.

**Output Requirements:**
- You MUST generate two distinct Markdown tables.
- Do NOT include any text, titles, or explanations outside of these two tables.

---

**TABLE 1: Responsibilities & Alignment with JD**
1.  Identify the 6-7 most critical responsibilities from the Job Description.
2.  Create a Markdown table with the following columns: | Responsibility | ${resumeColumns} | Notes |
3.  For each responsibility, evaluate each resume's alignment. Use these exact emojis: ✅ for a strong match, and ◐ for a partial match. Do not use any other symbols or words.
4.  In the "Notes" column, provide a brief, insightful comment highlighting key differentiators or the strongest candidate for that specific responsibility.

---

**TABLE 2: ATS Score Estimate**
1.  Immediately after the first table, create a second Markdown table with the following columns: | Resume | Skills Match | Responsibilities Match | Soft / Agile Match | Overall ATS Score |
2.  Create one row for each resume provided (e.g., "Resume 1", "Resume 2").
3.  For each match column, provide a percentage score (e.g., "90%").
4.  For the "Overall ATS Score" column, provide a tight percentage range (e.g., "91-93%").

---JOB DESCRIPTION---
${jobDescription}

---RESUMES TO ANALYZE---
`;

        resumesData.forEach(resume => {
            prompt += `
---RESUME ${resume.id}---
${resume.content}
`;
        });

        const result = await callGeminiAPI(prompt);
        loader.style.display = 'none';
        
        if (result) {
            // Use the 'marked' library to parse the Markdown response into HTML
            // Ensure you have the marked.js library included in your HTML file
            try {
                resultsDiv.innerHTML = marked.parse(result);
            } catch (e) {
                 console.error("Error parsing Markdown:", e);
                 resultsDiv.innerHTML = '<p class="placeholder">Failed to parse the response. Please see the console for details.</p>';
            }
        } else {
             resultsDiv.innerHTML = '<p class="placeholder">Analysis failed. Please try again.</p>';
        }
    };
    
    // --- Event Listeners ---
    addResumeField(); // Add the first resume field on page load
    addResumeBtn.addEventListener('click', addResumeField);
    compareBtn.addEventListener('click', analyzeResumes);
});