/**
 * PF2e Narrative Seeds - Error Notifications
 * User-facing error notification system for graceful error handling
 * Shows meaningful messages to users when data loading or generation fails
 */

export class ErrorNotifications {
  // Track errors to avoid spamming user
  static recentErrors = new Map();
  static ERROR_COOLDOWN = 30000; // 30 seconds
  static MAX_ERRORS_PER_SESSION = 5;
  static errorCount = 0;

  /**
   * Show error to user (with throttling to avoid spam)
   * @param {string} errorType - Type of error (data-load, generation, etc.)
   * @param {string} message - User-friendly error message
   * @param {Error} error - Original error object (optional)
   * @param {boolean} critical - If true, always show (bypass throttling)
   */
  static showError(errorType, message, error = null, critical = false) {
    const errorKey = `${errorType}:${message}`;
    const now = Date.now();

    // Check if this exact error was shown recently
    if (!critical && this.recentErrors.has(errorKey)) {
      const lastShown = this.recentErrors.get(errorKey);
      if (now - lastShown < this.ERROR_COOLDOWN) {
        // Only log to console, don't show to user again
        console.warn(`PF2e Narrative Seeds | [Throttled] ${message}`, error);
        return;
      }
    }

    // Check session error limit (prevent error spam)
    if (!critical && this.errorCount >= this.MAX_ERRORS_PER_SESSION) {
      console.warn(`PF2e Narrative Seeds | [Suppressed - limit reached] ${message}`, error);
      return;
    }

    // Show notification to user
    if (typeof ui !== 'undefined' && ui.notifications) {
      ui.notifications.error(`PF2e Narrative Seeds | ${message}`, { permanent: critical });
    }

    // Log to console for debugging
    console.error(`PF2e Narrative Seeds | ${message}`, error);

    // Track this error
    this.recentErrors.set(errorKey, now);
    this.errorCount++;

    // Clean up old entries
    this.cleanupOldErrors();
  }

  /**
   * Show warning to user (less severe than error)
   * @param {string} message - User-friendly warning message
   * @param {boolean} persistent - If true, warning stays until dismissed
   */
  static showWarning(message, persistent = false) {
    if (typeof ui !== 'undefined' && ui.notifications) {
      ui.notifications.warn(`PF2e Narrative Seeds | ${message}`, { permanent: persistent });
    }
    console.warn(`PF2e Narrative Seeds | ${message}`);
  }

  /**
   * Show info message to user
   * @param {string} message - Info message
   */
  static showInfo(message) {
    if (typeof ui !== 'undefined' && ui.notifications) {
      ui.notifications.info(`PF2e Narrative Seeds | ${message}`);
    }
    console.log(`PF2e Narrative Seeds | ${message}`);
  }

  /**
   * Handle data loading error with user-friendly message
   * @param {string} dataType - Type of data (locations, damage, templates, etc.)
   * @param {string} key - Specific key (anatomy type, damage type, etc.)
   * @param {Error} error - Original error
   * @returns {string} Fallback message to show in narrative
   */
  static handleDataLoadError(dataType, key, error) {
    const errorMessages = {
      'locations': `Could not load hit locations for ${key}. Using fallback.`,
      'damage': `Could not load damage effects for ${key}. Using basic descriptions.`,
      'templates': `Could not load narrative templates. Using simplified format.`,
      'openings': `Could not load opening phrases. Using default language.`,
      'anatomy-overrides': `Could not load special effects for ${key}. Using standard effects.`,
      'size-modifiers': `Could not load size modifiers. Skipping size-based narrative.`
    };

    const message = errorMessages[dataType] || `Could not load ${dataType} data.`;
    this.showWarning(message);

    return this.getFallbackNarrative(dataType);
  }

  /**
   * Handle generation error with user-friendly message
   * @param {string} detailLevel - Detail level that failed
   * @param {Error} error - Original error
   * @returns {string} Fallback narrative
   */
  static handleGenerationError(detailLevel, error) {
    this.showError(
      'generation',
      `Narrative generation failed (${detailLevel} mode). Using simplified description.`,
      error,
      false
    );

    return "The attack connects!";
  }

  /**
   * Handle critical module error (module not loading, etc.)
   * @param {string} component - Component that failed
   * @param {Error} error - Original error
   */
  static handleCriticalError(component, error) {
    this.showError(
      'critical',
      `Critical error in ${component}. Module may not function correctly.`,
      error,
      true // Always show critical errors
    );
  }

  /**
   * Get fallback narrative for data type
   * @private
   * @param {string} dataType - Type of data
   * @returns {string} Fallback text
   */
  static getFallbackNarrative(dataType) {
    const fallbacks = {
      'locations': 'their body',
      'damage': 'causing damage',
      'templates': 'The attack hits!',
      'openings': 'You attack',
      'anatomy-overrides': '',
      'size-modifiers': ''
    };

    return fallbacks[dataType] || '';
  }

  /**
   * Clean up old error entries to prevent memory leak
   * @private
   */
  static cleanupOldErrors() {
    const now = Date.now();
    for (const [key, timestamp] of this.recentErrors.entries()) {
      if (now - timestamp > this.ERROR_COOLDOWN * 2) {
        this.recentErrors.delete(key);
      }
    }
  }

  /**
   * Reset error tracking (for testing or new session)
   */
  static reset() {
    this.recentErrors.clear();
    this.errorCount = 0;
  }

  /**
   * Get current error statistics
   * @returns {Object} Error stats
   */
  static getStats() {
    return {
      totalErrors: this.errorCount,
      recentErrorTypes: this.recentErrors.size,
      maxErrorsPerSession: this.MAX_ERRORS_PER_SESSION,
      remainingAllowedErrors: Math.max(0, this.MAX_ERRORS_PER_SESSION - this.errorCount)
    };
  }
}
