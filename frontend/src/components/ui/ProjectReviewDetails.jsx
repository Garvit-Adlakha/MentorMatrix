import React from 'react';
import { motion } from 'motion/react';
import { IconStar, IconListCheck, IconAlertCircle, IconShieldCheck, IconCloudUpload, 
         IconUserCheck, IconCoins, IconScale, IconFileDescription } from '../ui/Icons';

/**
 * Component that displays a structured project review with sections and formatting
 */
const ProjectReviewDetails = ({ reviewText, loading, error }) => {
  // Icons for different sections of the review
  const sectionIcons = {
    'Overall Score': <IconStar size={20} className="text-yellow-500" />,
    'Project Strengths': <IconListCheck size={20} className="text-green-500" />,
    'Areas for Improvement': <IconAlertCircle size={20} className="text-orange-500" />,
    'Missing Information / Risks': <IconShieldCheck size={20} className="text-rose-500" />,
    'Deployment': <IconCloudUpload size={20} className="text-blue-500" />,
    'Team': <IconUserCheck size={20} className="text-indigo-500" />,
    'Monetization': <IconCoins size={20} className="text-amber-500" />,
    'Ethical & Regulatory Considerations (if applicable)': <IconScale size={20} className="text-purple-500" />,
  };

  // Parse the review text into sections
  function parseSections(text) {
    if (!text) return [];
    
    console.log("Original text:", text); // Debug log
    
    // More flexible regex to match various section header formats
    // This handles numbered headers like "1. Title:" or just "Title:" with varying spaces and formats
    const sectionRegex = /^\s*(?:(\d+)[\.\)]\s*)?([A-Za-z][A-Za-z& /(),]+)[:.]?(?:\s|$)/gm;
    
    const matches = [...text.matchAll(sectionRegex)];
    console.log("Regex matches:", matches); // Debug log
    
    if (matches.length === 0) {
      console.log("No sections found with regex pattern"); // Debug log
      
      // As a fallback, try to split by numbers at the beginning of lines
      const fallbackSections = [];
      const numberPattern = /^\s*(\d+)[\.:\)]/gm;
      let fallbackMatches = [...text.matchAll(numberPattern)];
      
      if (fallbackMatches.length > 0) {
        console.log("Found numbered sections with fallback pattern"); // Debug log
        for (let i = 0; i < fallbackMatches.length; i++) {
          const startIdx = fallbackMatches[i].index;
          const endIdx = i + 1 < fallbackMatches.length ? fallbackMatches[i + 1].index : text.length;
          const sectionText = text.slice(startIdx, endIdx).trim();
          const sectionLines = sectionText.split('\n');
          const titleLine = sectionLines[0].trim();
          
          // Extract title - remove the number and any trailing colons
          let title = titleLine.replace(/^\s*\d+[\.:\)]\s*/, '').replace(/[:.]$/, '').trim();
          const content = sectionLines.slice(1).join('\n').trim();
          
          // Map titles to our expected format
          if (title.toLowerCase().includes('overall score') || title.toLowerCase().includes('score')) title = 'Overall Score';
          if (title.toLowerCase().includes('strength')) title = 'Project Strengths';
          if (title.toLowerCase().includes('improvement')) title = 'Areas for Improvement';
          if (title.toLowerCase().includes('missing') || title.toLowerCase().includes('risk')) title = 'Missing Information / Risks';
          
          fallbackSections.push({ title, content });
        }
        return fallbackSections;
      }
      
      // If all else fails, create a default section with the entire content
      return [{ title: 'Overall Review', content: text }];
    }
    
    const sections = [];
    for (let i = 0; i < matches.length; i++) {
      const startIdx = matches[i].index;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
      let title = matches[i][2].trim();
      
      // Normalize for icon lookup
      if (title.toLowerCase().includes('overall score') || title.toLowerCase().includes('score')) title = 'Overall Score';
      if (title.toLowerCase().includes('strength')) title = 'Project Strengths';
      if (title.toLowerCase().includes('improvement')) title = 'Areas for Improvement';
      if (title.toLowerCase().includes('missing') || title.toLowerCase().includes('risk')) title = 'Missing Information / Risks';
      if (title.toLowerCase().includes('deployment')) title = 'Deployment';
      if (title.toLowerCase().includes('team')) title = 'Team';
      if (title.toLowerCase().includes('monetization')) title = 'Monetization';
      if (title.toLowerCase().includes('ethical')) title = 'Ethical & Regulatory Considerations (if applicable)';
      
      const content = text.slice(startIdx + matches[i][0].length, endIdx).trim();
      sections.push({ title, content });
    }
    
    console.log("Final sections:", sections); // Debug log
    return sections;
  }

  // Format content with bullet points and indentation
  function formatContent(content) {
    if (!content) return '';
    
    // Replace markdown bullet points with HTML
    let formatted = content
      .replace(/^\s*\*\s+(.*)/gm, '<li>$1</li>')
      .replace(/^\s*-\s+(.*)/gm, '<li>$1</li>')
      .replace(/^\s*\*\*([^:]+):\*\*\s*(.*)/gm, '<p><strong>$1:</strong> $2</p>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      
    // Wrap consecutive list items in a ul
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*?<\/li>\s*)+/gs, match => `<ul class="my-2">${match}</ul>`);
    }
    
    // Convert newlines to paragraphs for non-list text
    const paragraphs = [];
    const processedContent = formatted.replace(/<ul>.*?<\/ul>/gs, match => {
      paragraphs.push(match);
      return '<!--PARAGRAPH_PLACEHOLDER-->';
    });
    
    const lines = processedContent.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.includes('<p>'));
    
    let result = '';
    for (const line of lines) {
      if (line === '<!--PARAGRAPH_PLACEHOLDER-->') {
        result += paragraphs.shift();
      } else {
        result += `<p class="mb-3">${line}</p>`;
      }
    }
    
    return result;
  }

  // Helper to extract score from the Overall Score section
  function extractScore(content) {
    // Extract score like '7/10' or just '7' from content
    const scoreMatch = content.match(/(\d+(?:\.\d+)?)(?:\/\d+)?/);
    return scoreMatch ? scoreMatch[1] : null;
  }

  // Extract score from the entire review text if no sections are found
  function extractScoreFromFullText(text) {
    const scorePattern = /(?:overall\s+score|score|rating):\s*(\d+(?:\.\d+)?)(?:\/10)?/i;
    const match = text.match(scorePattern);
    return match ? match[1] : null;
  }

  // Normalize score for display: remove trailing .0 and determine if badge should show
  function normalizeScore(scoreStr) {
    if (!scoreStr) return { display: null, showBadge: false };
    const num = Number(scoreStr);
    if (Number.isNaN(num)) return { display: scoreStr, showBadge: !scoreStr.includes('.') };
    if (Number.isInteger(num)) return { display: String(num), showBadge: true };
    if (Math.abs(num - Math.round(num)) < 1e-9) return { display: String(Math.round(num)), showBadge: true };
    return { display: String(num), showBadge: false };
  }

  if (loading) {
    return (
      <div className="review-loading">
        <div className="modal-spinner">
          <div className="modal-spinner-ring"></div>
          <div className="modal-spinner-icon">✨</div>
        </div>
        <p className="modal-loading-title">Generating AI review...</p>
        <p className="modal-loading-subtitle">This might take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-error">
        <h3 className="modal-error-title">
          <span>✕</span>
          Unable to generate review
        </h3>
        <p>We couldn't generate a review for this project at the moment. Please try again later.</p>
      </div>
    );
  }

  const sections = parseSections(reviewText);
  console.log(sections);
  
  // Extract score regardless of section parsing
  const rawOverall = sections.find(s => s.title === 'Overall Score') ?
    extractScore(sections.find(s => s.title === 'Overall Score').content) : 
    extractScoreFromFullText(reviewText);
  const { display: overallScore, showBadge: overallShowBadge } = normalizeScore(rawOverall);

  // If no sections were parsed, create a simple structure with the score
  if (sections.length === 0 && reviewText) {
    return (
      <div className="review-details">
        {/* Score Circle */}
        {overallScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="review-section review-section--score"
          >
            <div className="review-section-header">
              <div className="review-section-icon">
                <IconStar size={24} className="text-yellow-500" />
              </div>
              <h3 className="review-section-title">
                Overall Score
              </h3>
            </div>
            
            <div className="review-score">
              <div className="review-score-ring">
                <span className="review-score-value">
                    {overallScore || '?'}
                </span>
              </div>
              {overallShowBadge && (
                <div className="review-score-badge">/10</div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Full review text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.1,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="review-section"
        >
          <div className="review-section-header">
            <div className="review-section-icon">
              <IconFileDescription size={24} className="text-primary" />
            </div>
            <h3 className="review-section-title">
              Project Review
            </h3>
          </div>
          
          <div className="review-content">
            <div dangerouslySetInnerHTML={{ __html: formatContent(reviewText) }} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="review-details">
      {sections.map((section, idx) => (
        <motion.div
          key={section.title + idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: idx * 0.08,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="review-section"
        >
          <div className="review-section-header">
            <div className="review-section-icon">
              {sectionIcons[section.title] || <IconFileDescription size={24} className="text-primary" />}
            </div>
            <h3 className="review-section-title">
              {section.title}
            </h3>
          </div>
          
          {section.title === 'Overall Score' ? (
            <div className="review-score">
              <div className="review-score-ring">
                <span className="review-score-value">
                    {normalizeScore(extractScore(section.content)).display || '?'}
                </span>
              </div>
              {(() => {
                const { display, showBadge } = normalizeScore(extractScore(section.content));
                return display && showBadge ? (
                  <div className="review-score-badge">/10</div>
                ) : null;
              })()}
              <p className="review-score-note">
                {section.content.replace(/\d+(?:\/\d+)?/, '').trim()}
              </p>
            </div>
          ) : (
            <div className="review-content">
              <div dangerouslySetInnerHTML={{ __html: formatContent(section.content) }} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectReviewDetails;