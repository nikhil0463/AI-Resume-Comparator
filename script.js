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
                        "parts": [{
                            "text": prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            // Access the text from the correct location in the response
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            resultsDiv.innerHTML = `<p style="color: red;"><strong>Error:</strong> ${error.message}. Please check your API key and network connection.</p>`;
            return null;
        }
    };

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

        // Construct a detailed prompt for the Gemini API
        let prompt = `
            You are an expert ATS (Applicant Tracking System) and a senior technical recruiter. Your task is to analyze the following job description and resumes.

            **Instructions:**
            1.  First, analyze the Job Description to identify key responsibilities, skills (technical and soft), required years of experience, and educational qualifications.
            2.  For EACH resume, provide a detailed ATS analysis with the following structure:
                * **Overall Match Score:** A percentage score (e.g., 85%) indicating how well the resume matches the job description.
                * **Keyword Analysis:** List of important keywords from the job description and indicate which were found and which are missing in the resume.
                * **Skills & Qualifications Analysis:** A summary of how the candidate's skills, experience (years and relevance), and education align with the job requirements.
                * **Actionable Recommendations:** Suggest specific improvements for the candidate to better tailor their resume for this job.
            3.  After analyzing all resumes individually, create a "Comparative Summary & Recommendation" section.
            4.  This summary MUST be a markdown table comparing key metrics (like Match Score, Years of Experience Match, Key Skills Match) for all candidates side-by-side.
            5.  Conclude with a final recommendation on which candidate is the best fit and why.
            6.  The entire output MUST be in GitHub-flavored Markdown for clear formatting.

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
            // Use marked.js to convert Markdown to HTML
            resultsDiv.innerHTML = marked.parse(result);
        } else {
             resultsDiv.innerHTML += '<p class="placeholder">Analysis failed. Please try again.</p>';
        }
    };
    
    // Add initial resume field
    addResumeField();

    addResumeBtn.addEventListener('click', addResumeField);
    compareBtn.addEventListener('click', analyzeResumes);
});