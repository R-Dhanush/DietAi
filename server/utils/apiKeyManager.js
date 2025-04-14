require('dotenv').config();
const axios = require('axios');

class ApiKeyManager {
  constructor() {
    this.keys = [
      process.env.SPOONACULAR_API_KEY_1,
      process.env.SPOONACULAR_API_KEY_2,
      process.env.SPOONACULAR_API_KEY_3
    ].filter(Boolean);
    
    this.currentKeyIndex = parseInt(process.env.ACTIVE_API_KEY_INDEX || 0) % this.keys.length;
    this.remainingRequests = 150;
    this.lastReset = new Date();
    this.keyStats = this.keys.reduce((acc, _, index) => {
      acc[index] = {
        lastUsed: null,
        errors: 0,
        success: 0,
        quotaUsed: 0
      };
      return acc;
    }, {});
    this.healthCheckInterval = setInterval(this.checkKeyHealth.bind(this), 3600000); // hourly health check
  }

  shouldResetQuota() {
    const now = new Date();
    return now.getDate() !== this.lastReset.getDate() || 
           now.getMonth() !== this.lastReset.getMonth() ||
           now.getFullYear() !== this.lastReset.getFullYear();
  }

  async checkKeyHealth() {
    try {
      const testEndpoint = 'https://api.spoonacular.com/recipes/complexSearch';
      const params = {
        query: 'test',
        number: 1,
        apiKey: this.getCurrentKey()
      };
      
      await axios.get(testEndpoint, {
        params,
        timeout: 5000
      });
      
      this.keyStats[this.currentKeyIndex].success++;
    } catch (error) {
      this.keyStats[this.currentKeyIndex].errors++;
      console.warn(`Health check failed for key index ${this.currentKeyIndex}:`, error.message);
      
      if (error.response?.status === 402) {
        this.rotateKey(true); // force rotate if quota exceeded
      }
    }
  }

  getCurrentKey() {
    if (this.shouldResetQuota()) {
      this.remainingRequests = 150;
      this.lastReset = new Date();
      this.resetAllKeyStats();
    }
    
    if (this.keys.length === 0) {
      throw new Error('No Spoonacular API keys configured');
    }
    
    this.keyStats[this.currentKeyIndex].lastUsed = new Date();
    return this.keys[this.currentKeyIndex];
  }

  getBestKey() {
    // Get key with highest success rate and lowest errors
    const sortedKeys = Object.entries(this.keyStats)
      .sort(([, a], [, b]) => {
        const aScore = (a.success / (a.errors + 1)) - (a.quotaUsed / 150);
        const bScore = (b.success / (b.errors + 1)) - (b.quotaUsed / 150);
        return bScore - aScore;
      });
    
    return this.keys[sortedKeys[0][0]];
  }

  hasBackupKey() {
    return this.keys.length > 1;
  }

  updateRemainingRequests(count) {
    this.remainingRequests = count;
    this.keyStats[this.currentKeyIndex].quotaUsed = 150 - count;
  }

  rotateKey(force = false) {
    if (this.keys.length <= 1 && !force) {
      return this.keys[0]; // can't rotate, return current key
    }
    
    // Choose next key based on health stats
    const newIndex = force 
      ? (this.currentKeyIndex + 1) % this.keys.length
      : Object.keys(this.keyStats)
          .map(Number)
          .find(index => index !== this.currentKeyIndex && this.keyStats[index].errors < 5) 
          || (this.currentKeyIndex + 1) % this.keys.length;
    
    this.currentKeyIndex = newIndex;
    this.remainingRequests = 150;
    this.lastReset = new Date();
    
    console.log(`Rotated to API key index ${this.currentKeyIndex}`, {
      previousUsage: this.keyStats[this.currentKeyIndex]
    });
    
    // Update environment variable to persist active key index
    process.env.ACTIVE_API_KEY_INDEX = this.currentKeyIndex.toString();
    
    return this.keys[this.currentKeyIndex];
  }

  resetAllKeyStats() {
    Object.keys(this.keyStats).forEach(index => {
      this.keyStats[index] = {
        lastUsed: null,
        errors: 0,
        success: 0,
        quotaUsed: 0
      };
    });
  }

  getKeyStatus() {
    return {
      currentKeyIndex: this.currentKeyIndex,
      remainingRequests: this.remainingRequests,
      keys: this.keys.map((_, index) => ({
        index,
        lastUsed: this.keyStats[index].lastUsed,
        errors: this.keyStats[index].errors,
        success: this.keyStats[index].success,
        quotaUsed: this.keyStats[index].quotaUsed,
        isActive: index === this.currentKeyIndex
      }))
    };
  }

  // Graceful shutdown
  cleanup() {
    clearInterval(this.healthCheckInterval);
  }
}

// Singleton pattern with graceful shutdown handling
const apiKeyManager = new ApiKeyManager();

process.on('SIGINT', () => {
  apiKeyManager.cleanup();
  process.exit();
});

process.on('SIGTERM', () => {
  apiKeyManager.cleanup();
  process.exit();
});

module.exports = apiKeyManager;