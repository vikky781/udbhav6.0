const natural = require('natural');
const Sentiment = require('sentiment');
const compromise = require('compromise');
const diff = require('diff');

class AIAnalysisService {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  // Text analysis methods
  analyzeText(text) {
    const analysis = {
      sentiment: this.analyzeSentiment(text),
      readability: this.analyzeReadability(text),
      complexity: this.analyzeComplexity(text),
      grammar: this.analyzeGrammar(text),
      keywords: this.extractKeywords(text),
      entities: this.extractEntities(text)
    };

    return analysis;
  }

  analyzeSentiment(text) {
    const result = this.sentiment.analyze(text);
    return {
      score: result.score,
      magnitude: Math.abs(result.score),
      label: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
      comparative: result.comparative
    };
  }

  analyzeReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text);
    const syllables = this.countSyllables(text);

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    let level;
    if (fleschScore >= 90) level = 'Very Easy';
    else if (fleschScore >= 80) level = 'Easy';
    else if (fleschScore >= 70) level = 'Fairly Easy';
    else if (fleschScore >= 60) level = 'Standard';
    else if (fleschScore >= 50) level = 'Fairly Difficult';
    else if (fleschScore >= 30) level = 'Difficult';
    else level = 'Very Difficult';

    return {
      score: Math.round(fleschScore),
      level,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 100) / 100,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100
    };
  }

  analyzeComplexity(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const uniqueWords = [...new Set(words)];
    const totalWords = words.length;
    const uniqueRatio = uniqueWords.length / totalWords;

    // Calculate lexical diversity
    const lexicalDiversity = uniqueRatio;

    // Calculate average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / totalWords;

    // Calculate sentence complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = totalWords / sentences.length;

    let complexityLevel;
    if (lexicalDiversity > 0.7 && avgWordLength > 5) complexityLevel = 'High';
    else if (lexicalDiversity > 0.5 && avgWordLength > 4) complexityLevel = 'Medium';
    else complexityLevel = 'Low';

    return {
      score: Math.round(lexicalDiversity * 100),
      level: complexityLevel,
      lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
      avgWordLength: Math.round(avgWordLength * 100) / 100,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 100) / 100
    };
  }

  analyzeGrammar(text) {
    const issues = [];
    const suggestions = [];

    // Basic grammar checks
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      
      // Check for capitalization
      if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
        issues.push(`Sentence ${index + 1}: Should start with capital letter`);
      }

      // Check for double spaces
      if (trimmed.includes('  ')) {
        issues.push(`Sentence ${index + 1}: Contains double spaces`);
      }

      // Check for common grammar issues
      if (trimmed.toLowerCase().includes('its ') && !trimmed.toLowerCase().includes("it's")) {
        // This is a basic check - in reality, you'd need more sophisticated grammar checking
      }
    });

    return {
      issues,
      suggestions,
      score: Math.max(0, 100 - (issues.length * 10))
    };
  }

  extractKeywords(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const filteredWords = words.filter(word => 
      word.length > 3 && 
      !stopWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    );

    const wordFreq = {};
    filteredWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, freq]) => ({ word, frequency: freq }));

    return keywords;
  }

  extractEntities(text) {
    const doc = compromise(text);
    const entities = {
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array'),
      dates: doc.dates().out('array'),
      money: doc.money().out('array'),
      percentages: doc.percentages().out('array')
    };

    return entities;
  }

  // Code analysis methods
  analyzeCode(code, language = 'javascript') {
    const analysis = {
      complexity: this.analyzeCodeComplexity(code, language),
      quality: this.analyzeCodeQuality(code, language),
      style: this.analyzeCodeStyle(code, language),
      metrics: this.calculateCodeMetrics(code)
    };

    return analysis;
  }

  analyzeCodeComplexity(code, language) {
    const lines = code.split('\n');
    let complexity = 0;
    const issues = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Count control structures
      if (trimmed.includes('if') || trimmed.includes('else')) complexity += 1;
      if (trimmed.includes('for') || trimmed.includes('while')) complexity += 2;
      if (trimmed.includes('switch') || trimmed.includes('case')) complexity += 2;
      if (trimmed.includes('try') || trimmed.includes('catch')) complexity += 1;

      // Check for nested structures
      const indentLevel = (line.match(/^\s*/) || [''])[0].length;
      if (indentLevel > 8) {
        issues.push(`Line ${index + 1}: Deep nesting detected`);
      }

      // Check for long lines
      if (line.length > 120) {
        issues.push(`Line ${index + 1}: Line too long (${line.length} characters)`);
      }
    });

    let level;
    if (complexity > 20) level = 'High';
    else if (complexity > 10) level = 'Medium';
    else level = 'Low';

    return {
      score: complexity,
      level,
      issues
    };
  }

  analyzeCodeQuality(code, language) {
    const issues = [];
    const suggestions = [];

    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check for commented code
      if (trimmed.startsWith('//') && trimmed.length > 2) {
        suggestions.push(`Line ${index + 1}: Consider removing commented code`);
      }

      // Check for TODO comments
      if (trimmed.toLowerCase().includes('todo')) {
        issues.push(`Line ${index + 1}: TODO comment found`);
      }

      // Check for console.log (in production code)
      if (trimmed.includes('console.log')) {
        suggestions.push(`Line ${index + 1}: Remove console.log statements`);
      }
    });

    return {
      issues,
      suggestions,
      score: Math.max(0, 100 - (issues.length * 5) - (suggestions.length * 2))
    };
  }

  analyzeCodeStyle(code, language) {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for consistent indentation
      if (line.length > 0 && line[0] === ' ' && line[1] !== ' ') {
        issues.push(`Line ${index + 1}: Inconsistent indentation`);
      }

      // Check for trailing whitespace
      if (line.endsWith(' ')) {
        issues.push(`Line ${index + 1}: Trailing whitespace`);
      }
    });

    return {
      issues,
      score: Math.max(0, 100 - (issues.length * 5))
    };
  }

  calculateCodeMetrics(code) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*'));
    
    const words = code.split(/\s+/).filter(word => word.length > 0);
    const characters = code.length;

    return {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      commentLines: commentLines.length,
      commentRatio: Math.round((commentLines.length / lines.length) * 100) / 100,
      wordCount: words.length,
      characterCount: characters,
      avgLineLength: Math.round(characters / lines.length)
    };
  }

  // Plagiarism detection
  async detectPlagiarism(text, submissions = []) {
      // Clean and normalize the text (remove markdown and normalize whitespace)
      const cleanText = text ? text.replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
                                  .replace(/\s+/g, ' ')                 // Normalize whitespace
                                  .trim() : '';
                                
      if (!cleanText) {
      console.error('Invalid text provided for plagiarism detection:', text);
      return {
        score: 0,
        sources: [],
        totalSources: 0,
        checkedSources: 0,
        error: 'Invalid text provided'
      };
    }

      console.log(`Checking plagiarism for text of length ${cleanText.length}`);
    console.log(`Number of submissions to check against: ${submissions.length}`);

    const similarities = [];
      const textTokens = this.tokenizer.tokenize(cleanText.toLowerCase());
    
    if (!textTokens || textTokens.length === 0) {
      console.error('No tokens extracted from text');
      return {
        score: 0,
        sources: [],
        totalSources: submissions.length,
        checkedSources: 0,
        error: 'No valid text content'
      };
    }

    const textStems = textTokens.map(token => this.stemmer.stem(token));
    console.log(`Number of tokens in submitted text: ${textTokens.length}`);

    for (const submission of submissions) {
        // Clean and normalize the submission content
        const cleanSubmissionContent = submission.content ? 
          submission.content.replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
                           .replace(/\s+/g, ' ')                 // Normalize whitespace
                           .trim() : '';
                         
        if (!cleanSubmissionContent) {
        console.log(`Skipping submission ${submission._id}: Invalid content`);
        continue;
      }

        if (cleanSubmissionContent === cleanText) {
        console.log(`Skipping self-comparison for submission ${submission._id}`);
        continue;
      }
      
        const submissionTokens = this.tokenizer.tokenize(cleanSubmissionContent.toLowerCase());
      
      if (!submissionTokens || submissionTokens.length === 0) {
        console.log(`Skipping submission ${submission._id}: No valid tokens`);
        continue;
      }

      const submissionStems = submissionTokens.map(token => this.stemmer.stem(token));
      console.log(`Comparing with submission ${submission._id} (${submissionTokens.length} tokens)`);
      
      const similarity = this.calculateSimilarity(textStems, submissionStems);
      console.log(`Similarity score with submission ${submission._id}: ${similarity}`);
      
      // Lower threshold (5%) to catch more potential plagiarism
      if (similarity > 0.05) {
        similarities.push({
          submissionId: submission._id,
          title: submission.title,
          author: submission.author,
          similarity: Math.round(similarity * 100) / 100,
          matchingText: this.findMatchingText(text, submission.content)
        });
      }
    }

    console.log(`Found ${similarities.length} similar submissions above threshold`);
    
    // Calculate total plagiarism score
    // Ensure we always return a valid number for the score
    let score;
    if (similarities.length > 0) {
      const validSimilarities = similarities
        .map(s => s.similarity)
        .filter(s => typeof s === 'number' && !isNaN(s));
    
      if (validSimilarities.length > 0) {
        // Return the highest similarity as percentage (already in 0-1 range, just convert to percentage)
        score = Math.round(Math.max(...validSimilarities) * 100);
      } else {
        score = 0;
      }
    } else {
      score = 0;
    }
    
    console.log(`Calculated plagiarism score: ${score}%`);

    const result = {
        score: score || 0, // Ensure we never return NaN
      sources: similarities.sort((a, b) => b.similarity - a.similarity),
      totalSources: submissions.length,
      checkedSources: submissions.filter(s => s.content && typeof s.content === 'string').length
    };

    console.log('Plagiarism detection result:', {
      score: result.score,
      sourcesFound: result.sources.length,
      totalSources: result.totalSources,
      checkedSources: result.checkedSources
    });

    return result;
  }

  calculateSimilarity(tokens1, tokens2) {
    // Calculate Jaccard similarity
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    let jaccardSim = 0;
    if (union.size > 0) {
      jaccardSim = intersection.size / union.size;
    }

    // Calculate sequence similarity using n-grams (use 2-grams for better detection)
    const ngrams1 = this.getNgrams(tokens1, 2);
    const ngrams2 = this.getNgrams(tokens2, 2);
    
    let sequenceSim = 0;
    if (ngrams1.length > 0 || ngrams2.length > 0) {
      const ngramIntersection = ngrams1.filter(ng1 => 
        ngrams2.some(ng2 => ng2.join(' ') === ng1.join(' '))
      );
      sequenceSim = ngramIntersection.length / Math.max(ngrams1.length, ngrams2.length, 1);
    }

    // Calculate word overlap similarity
    const commonWords = intersection.size;
    const totalWords = Math.min(tokens1.length, tokens2.length);
    const wordOverlapSim = totalWords > 0 ? commonWords / totalWords : 0;

    // Weighted combination with more emphasis on sequence matching
    const finalSimilarity = (jaccardSim * 0.3) + (sequenceSim * 0.5) + (wordOverlapSim * 0.2);
    
    console.log(`Similarity details - Jaccard: ${jaccardSim.toFixed(2)}, Sequence: ${sequenceSim.toFixed(2)}, Overlap: ${wordOverlapSim.toFixed(2)}, Final: ${finalSimilarity.toFixed(2)}`);
    
    return finalSimilarity;
  }

  getNgrams(tokens, n) {
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n));
    }
    return ngrams;
  }

  findMatchingText(text1, text2) {
    const chunks1 = this.createTextChunks(text1, 25); // Reduced chunk size
    const chunks2 = this.createTextChunks(text2, 25);
    
    const matches = [];
    
    chunks1.forEach((chunk1, i) => {
      chunks2.forEach((chunk2, j) => {
        // Normalize text for comparison
        const normalizedChunk1 = chunk1.toLowerCase().replace(/\s+/g, ' ').trim();
        const normalizedChunk2 = chunk2.toLowerCase().replace(/\s+/g, ' ').trim();
        
        // Calculate similarity
        const similarity = this.calculateSimilarity(
          this.tokenizer.tokenize(normalizedChunk1),
          this.tokenizer.tokenize(normalizedChunk2)
        );
        
        // Lower threshold (30%) for better plagiarism detection
        if (similarity > 0.3) {
          matches.push({
            text: chunk1,
            matchedText: chunk2,
            similarity: Math.round(similarity * 100) / 100
          });
        }
      });
    });

    // Sort by similarity and return top 5 matches
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  createTextChunks(text, chunkSize) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    
    return chunks;
  }

  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let syllables = 0;
    
    words.forEach(word => {
      if (word.length === 0) return;
      
      let count = 0;
      let previousWasVowel = false;
      
      for (let i = 0; i < word.length; i++) {
        const isVowel = /[aeiouy]/.test(word[i]);
        if (isVowel && !previousWasVowel) {
          count++;
        }
        previousWasVowel = isVowel;
      }
      
      if (word.endsWith('e')) count--;
      if (count === 0) count = 1;
      
      syllables += count;
    });
    
    return syllables;
  }

  // Generate feedback
  generateFeedback(analysis) {
    const feedback = {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      overallScore: 0
    };

    // Analyze sentiment
    if (analysis.sentiment.score > 0) {
      feedback.strengths.push('Positive tone and engagement');
    } else if (analysis.sentiment.score < -2) {
      feedback.weaknesses.push('Negative tone may affect readability');
      feedback.suggestions.push('Consider using more neutral or positive language');
    }

    // Analyze readability
    if (analysis.readability.score < 30) {
      feedback.weaknesses.push('Text is difficult to read');
      feedback.suggestions.push('Simplify sentence structure and use shorter words');
    } else if (analysis.readability.score > 70) {
      feedback.strengths.push('Good readability level');
    }

    // Analyze complexity
    if (analysis.complexity.level === 'High') {
      feedback.strengths.push('Rich vocabulary and complex ideas');
    } else if (analysis.complexity.level === 'Low') {
      feedback.suggestions.push('Consider using more varied vocabulary');
    }

    // Calculate overall score
    const scores = [
      analysis.sentiment.score > 0 ? 80 : 60,
      analysis.readability.score,
      analysis.complexity.score
    ];
    
    feedback.overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    return feedback;
  }
}

module.exports = new AIAnalysisService();
