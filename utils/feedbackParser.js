/**
 * Extracts specific feedback for a given skill from the full report analysis text.
 * 
 * @param {string} reportText The full analysis text from the AI
 * @param {string} skillName The name of the skill to extract feedback for
 * @returns {string} The extracted feedback or a fallback message
 */
export const extractSkillFeedback = (reportText, skillName) => {
    if (!reportText || typeof reportText !== 'string') return "No analysis available.";

    // Normalize skill name for searching
    const normalizedSkill = skillName.toLowerCase().replace(/-/g, ' ');

    // Patterns to look for (e.g., "Technical Proficiency:", "Technical Proficiency Analysis:", etc.)
    const patterns = [
        new RegExp(`(?:^|\\n)(?:##?\\s*)?${skillName}[:\\s-]+(.*?)(\\n\\n|\\n(?:##?\\s*)?[A-Z][a-z]+ [A-Z]|$)`, 'is'),
        new RegExp(`(?:^|\\n)(?:##?\\s*)?${normalizedSkill}[:\\s-]+(.*?)(\\n\\n|\\n(?:##?\\s*)?[A-Z][a-z]+ [A-Z]|$)`, 'is'),
        new RegExp(`analysis for ${normalizedSkill}[:\\s-]+(.*?)(\\n\\n|\\n(?:##?\\s*)?[A-Z][a-z]+ [A-Z]|$)`, 'is')
    ];

    const isScoreLine = (text) => {
        // Checks if the text is just a list of scores like "- Skill: 0/10"
        return /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*[:\s-]+0?\d\/\d+)/i.test(text) &&
            (text.match(/\d\/\d+/g) || []).length > 2;
    };

    for (const pattern of patterns) {
        const match = reportText.match(pattern);
        if (match && match[1]) {
            let feedback = match[0].trim();
            // Remove the header/skill name from the start if it matched it
            if (feedback.toLowerCase().startsWith(normalizedSkill) || feedback.toLowerCase().startsWith(skillName.toLowerCase())) {
                const firstNewline = feedback.indexOf('\n');
                if (firstNewline !== -1) {
                    feedback = feedback.substring(firstNewline + 1).trim();
                } else {
                    feedback = feedback.replace(new RegExp(`^${skillName}[:\\s-]+`, 'i'), '').trim();
                }
            }

            if (feedback.length > 10 && !isScoreLine(feedback)) return feedback;
        }
    }

    // Fallback: search for the skill name and take the following paragraph
    const lines = reportText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        if (lowerLine.includes(normalizedSkill) && !isScoreLine(lines[i])) {
            let feedbackLines = [];
            const colonIndex = lines[i].indexOf(':');
            if (colonIndex !== -1 && lines[i].length > colonIndex + 15) {
                feedbackLines.push(lines[i].substring(colonIndex + 1).trim());
            }

            for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
                const line = lines[j].trim();
                if (line === '' && feedbackLines.length > 0) break;
                if (/^[A-Z][A-Za-z\s]+:/.test(line) || isScoreLine(line)) break;
                if (line !== '') feedbackLines.push(line);
            }

            if (feedbackLines.length > 0) {
                const combined = feedbackLines.join('\n').trim();
                if (combined.length > 10 && !isScoreLine(combined)) return combined;
            }
        }
    }

    return `Refer to the full report for in-depth analysis on your ${skillName}.`;
};

/**
 * Extracts key opportunities (bullet points) for a given skill from the report text.
 * 
 * @param {string} reportText The full analysis text
 * @param {string} skillName The skill name
 * @param {string} feedback The already extracted feedback for this skill
 * @returns {string[]} An array of opportunity strings
 */
export const extractSkillOpportunities = (reportText, skillName, feedback = "") => {
    const textToSearch = feedback || reportText;
    const lines = textToSearch.split('\n');
    const opportunities = [];

    // Look for lines that start with bullet points or numbers
    const bulletPatterns = [
        /^[-*•]\s*(.*)/,
        /^\d+\.\s*(.*)/,
        /^Opportunity[:\s]+(.*)/i,
        /^Recommendation[:\s]+(.*)/i
    ];

    for (const line of lines) {
        const trimmed = line.trim();
        for (const pattern of bulletPatterns) {
            const match = trimmed.match(pattern);
            if (match && match[1] && match[1].length > 5) {
                // Avoid capturing the global score table lines if they look like bullets
                if (!/0?\d\/\d+/.test(match[1])) {
                    opportunities.push(match[1].trim());
                }
            }
        }
    }

    // Fallback if no specific bullets found in this section
    if (opportunities.length === 0) {
        return [
            `Focus on specific ${skillName.toLowerCase()} metrics`,
            "Prepare detailed project deep-dives",
            "Practice explaining complex concepts simply"
        ];
    }

    return opportunities.slice(0, 3); // Return top 3
};
