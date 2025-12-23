const EntityExtractor = require('../utils/entityExtractor');

/**
 * Service for automatic task classification and prioritization
 */
class ClassificationService {
  /**
   * Category keywords mapping
   */
  static CATEGORY_KEYWORDS = {
    scheduling: ['meeting', 'schedule', 'call', 'appointment', 'deadline', 'calendar', 
                 'reschedule', 'book', 'reserve', 'plan', 'arrange', 'coordinate', 
                 'session', 'conference', 'interview', 'presentation'],
    
    finance: ['payment', 'invoice', 'bill', 'budget', 'cost', 'expense', 'purchase',
              'procurement', 'financial', 'accounting', 'revenue', 'salary', 'payroll',
              'transaction', 'refund', 'reimbursement', 'vendor', 'contractor'],
    
    technical: ['bug', 'fix', 'error', 'install', 'repair', 'maintain', 'update',
                'upgrade', 'debug', 'troubleshoot', 'software', 'hardware', 'system',
                'server', 'network', 'database', 'code', 'deploy', 'configure'],
    
    safety: ['safety', 'hazard', 'inspection', 'compliance', 'ppe', 'accident',
             'incident', 'emergency', 'protocol', 'regulation', 'audit', 'risk',
             'health', 'security', 'evacuation', 'training', 'certification']
  };

  /**
   * Priority keywords mapping
   */
  static PRIORITY_KEYWORDS = {
    high: ['urgent', 'asap', 'immediately', 'today', 'critical', 'emergency',
           'priority', 'important', 'crucial', 'vital', 'pressing', 'now',
           'deadline today', 'overdue'],
    
    medium: ['soon', 'this week', 'important', 'upcoming', 'scheduled',
             'planned', 'next week', 'needed', 'required']
  };

  /**
   * Suggested actions by category
   */
  static SUGGESTED_ACTIONS = {
    scheduling: [
      'Block calendar',
      'Send invite',
      'Prepare agenda',
      'Set reminder',
      'Book meeting room',
      'Confirm attendance'
    ],
    
    finance: [
      'Check budget',
      'Get approval',
      'Generate invoice',
      'Update records',
      'Process payment',
      'Review expenses'
    ],
    
    technical: [
      'Diagnose issue',
      'Check resources',
      'Assign technician',
      'Document fix',
      'Test solution',
      'Deploy update'
    ],
    
    safety: [
      'Conduct inspection',
      'File report',
      'Notify supervisor',
      'Update checklist',
      'Schedule training',
      'Review protocols'
    ],
    
    general: [
      'Review details',
      'Assign owner',
      'Set deadline',
      'Track progress',
      'Update status',
      'Document outcome'
    ]
  };

  /**
   * Detect task category based on keywords
   */
  static detectCategory(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    
    // Count keyword matches for each category
    const categoryScores = {};
    
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      categoryScores[category] = 0;
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          categoryScores[category]++;
        }
      });
    }

    // Find category with highest score
    let maxScore = 0;
    let detectedCategory = 'general';
    
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedCategory = category;
      }
    }

    return detectedCategory;
  }

  /**
   * Detect task priority based on urgency indicators
   */
  static detectPriority(title, description, dueDate) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    
    // Check for high priority keywords
    for (const keyword of this.PRIORITY_KEYWORDS.high) {
      if (text.includes(keyword)) {
        return 'high';
      }
    }

    // Check for medium priority keywords
    for (const keyword of this.PRIORITY_KEYWORDS.medium) {
      if (text.includes(keyword)) {
        return 'medium';
      }
    }

    // Check due date proximity
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 1) {
        return 'high';
      } else if (daysUntilDue <= 7) {
        return 'medium';
      }
    }

    return 'low';
  }

  /**
   * Get suggested actions for a category
   */
  static getSuggestedActions(category) {
    return this.SUGGESTED_ACTIONS[category] || this.SUGGESTED_ACTIONS.general;
  }

  /**
   * Perform complete task classification
   */
  static classifyTask(taskData) {
    const { title, description, due_date, category: manualCategory, priority: manualPriority } = taskData;
    
    // Use manual category/priority if provided, otherwise auto-detect
    const category = manualCategory || this.detectCategory(title, description);
    const priority = manualPriority || this.detectPriority(title, description, due_date);
    
    // Extract entities
    const combinedText = `${title || ''} ${description || ''}`;
    const extractedEntities = EntityExtractor.extractAll(combinedText);
    
    // Get suggested actions
    const suggestedActions = this.getSuggestedActions(category);

    return {
      category,
      priority,
      extracted_entities: extractedEntities,
      suggested_actions: suggestedActions
    };
  }

  /**
   * Re-classify task (for updates)
   */
  static reclassifyTask(oldTask, updates) {
    // Only re-classify if title or description changed
    const needsReclassification = updates.title || updates.description;
    
    if (!needsReclassification) {
      return {
        category: updates.category || oldTask.category,
        priority: updates.priority || oldTask.priority,
        extracted_entities: oldTask.extracted_entities,
        suggested_actions: oldTask.suggested_actions
      };
    }

    // Merge old and new data
    const mergedData = {
      title: updates.title || oldTask.title,
      description: updates.description !== undefined ? updates.description : oldTask.description,
      due_date: updates.due_date !== undefined ? updates.due_date : oldTask.due_date,
      category: updates.category,
      priority: updates.priority
    };

    return this.classifyTask(mergedData);
  }
}

module.exports = ClassificationService;