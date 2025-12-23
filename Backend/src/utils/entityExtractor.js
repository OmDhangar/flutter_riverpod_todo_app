/**
 * Entity extraction utilities for parsing task descriptions
 */

class EntityExtractor {
  /**
   * Extract person names from text
   * Looks for patterns like "with John", "by Sarah", "assign to Mike"
   */
  static extractPeople(text) {
    if (!text) return [];
    
    const people = new Set();
    const patterns = [
      /(?:with|by|to|from|assign to|contact|meet|call)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:will|should|needs to|has to)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim();
        // Filter out common words that might be capitalized
        const commonWords = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 
                            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
                            'September', 'October', 'November', 'December', 'Today', 'Tomorrow'];
        
        if (!commonWords.includes(name) && name.length > 1) {
          people.add(name);
        }
      }
    });

    return Array.from(people);
  }

  /**
   * Extract dates and time references from text
   */
  static extractDates(text) {
    if (!text) return [];
    
    const dates = new Set();
    const patterns = [
      /\b(today|tomorrow|tonight|yesterday)\b/gi,
      /\b(this\s+(?:week|month|year|morning|afternoon|evening))\b/gi,
      /\b(next\s+(?:week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi,
      /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g,
      /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?)\b/gi,
      /\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        dates.add(match[1].toLowerCase());
      }
    });

    return Array.from(dates);
  }

  /**
   * Extract locations from text
   */
  static extractLocations(text) {
    if (!text) return [];
    
    const locations = new Set();
    const patterns = [
      /\b(?:at|in|to|from|near)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Office|Building|Room|Floor|Site|Location|Warehouse|Plant))?)\b/g,
      /\b(Room\s+\d+|Floor\s+\d+|Building\s+[A-Z])\b/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const location = match[1].trim();
        if (location.length > 2) {
          locations.add(location);
        }
      }
    });

    return Array.from(locations);
  }

  /**
   * Extract action verbs from text
   */
  static extractActions(text) {
    if (!text) return [];
    
    const actions = new Set();
    const actionVerbs = [
      'schedule', 'meet', 'call', 'email', 'contact', 'discuss', 'review',
      'prepare', 'complete', 'finish', 'submit', 'send', 'create', 'update',
      'fix', 'repair', 'install', 'maintain', 'inspect', 'check', 'verify',
      'approve', 'sign', 'authorize', 'process', 'order', 'purchase', 'pay',
      'deliver', 'ship', 'receive', 'coordinate', 'organize', 'plan', 'assign'
    ];

    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (actionVerbs.includes(cleanWord)) {
        actions.add(cleanWord);
      }
    });

    return Array.from(actions);
  }

  /**
   * Extract important keywords (nouns and key terms)
   */
  static extractKeywords(text) {
    if (!text) return [];
    
    const keywords = new Set();
    
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    // Extract words that are 4+ characters and not stop words
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    
    words.forEach(word => {
      if (!stopWords.has(word)) {
        keywords.add(word);
      }
    });

    return Array.from(keywords).slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Extract all entities from text
   */
  static extractAll(text) {
    if (!text) {
      return {
        people: [],
        dates: [],
        locations: [],
        actions: [],
        keywords: []
      };
    }

    return {
      people: this.extractPeople(text),
      dates: this.extractDates(text),
      locations: this.extractLocations(text),
      actions: this.extractActions(text),
      keywords: this.extractKeywords(text)
    };
  }
}

module.exports = EntityExtractor;