import { apiRequest } from '@/lib/queryClient';

class AnalyticsTracker {
  private sessionId: string | null = null;
  private userId: number | null = null;
  private sessionStartTime: Date | null = null;
  private currentPage: string = '';

  constructor() {
    this.initializeSession();
    this.setupPageTracking();
    this.setupBeforeUnload();
  }

  private initializeSession() {
    // Get current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userId = user.id;
        this.startSession();
      } catch (error) {
        console.error('Error parsing stored user for analytics:', error);
      }
    }
  }

  private async startSession() {
    if (!this.userId) return;

    try {
      this.sessionStartTime = new Date();
      const session = await apiRequest('/api/analytics/sessions', 'POST', {
        userId: this.userId,
        sessionStart: this.sessionStartTime.toISOString(),
        pageViews: 0
      });
      this.sessionId = session.id;
    } catch (error) {
      console.error('Error starting analytics session:', error);
    }
  }

  private setupPageTracking() {
    // Track initial page load
    this.trackPageView(window.location.pathname);

    // Listen for route changes (for SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.trackPageView(window.location.pathname), 0);
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.trackPageView(window.location.pathname), 0);
    };

    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Also end session on visibility change (when tab is closed/hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.endSession();
      }
    });
  }

  public trackPageView(page: string) {
    if (this.currentPage === page) return; // Don't track same page multiple times
    
    this.currentPage = page;
    
    if (!this.userId || !this.sessionId) return;

    // Track the page view activity
    this.trackActivity('page_view', { page });

    // Update session page views count
    this.updateSessionPageViews();
  }

  public trackActivity(activityType: string, details: any = {}) {
    if (!this.userId) return;

    apiRequest('/api/analytics/activity', 'POST', {
      userId: this.userId,
      activityType,
      activityDetails: details
    }).catch(error => {
      console.error('Error tracking activity:', error);
    });
  }

  private async updateSessionPageViews() {
    if (!this.sessionId) return;

    try {
      await apiRequest(`/api/analytics/sessions/${this.sessionId}`, 'PUT', {
        pageViews: await this.getSessionPageViews() + 1
      });
    } catch (error) {
      console.error('Error updating session page views:', error);
    }
  }

  private async getSessionPageViews(): Promise<number> {
    // This is simplified - in a real app you'd track this locally or fetch from server
    return 0;
  }

  private async endSession() {
    if (!this.sessionId || !this.sessionStartTime) return;

    try {
      const duration = Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000);
      await apiRequest(`/api/analytics/sessions/${this.sessionId}/end`, 'POST', {
        duration
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Public methods for tracking specific events
  public trackMessageSent(messageType: 'group_chat' | 'private', messageId: number) {
    this.trackActivity('message_sent', { messageType, messageId });
  }

  public trackQuestionSubmitted(panelName: string, questionId: number) {
    this.trackActivity('question_submitted', { panelName, questionId });
  }

  public trackConnectionRequested(targetUserId: number) {
    this.trackActivity('connection_requested', { targetUserId });
  }

  public trackSurveyViewed(surveyId: number) {
    this.trackActivity('survey_viewed', { surveyId });
  }

  public trackSurveyCompleted(surveyId: number, responseId: number) {
    this.trackActivity('survey_completed', { surveyId, responseId });
  }

  public trackProfileViewed(profileUserId: number) {
    this.trackActivity('profile_viewed', { profileUserId });
  }

  public trackTabChanged(tabName: string) {
    this.trackActivity('tab_changed', { tabName });
  }

  public trackButtonClick(buttonType: string, location: string, details: any = {}) {
    this.trackActivity('button_click', { buttonType, location, ...details });
  }

  public trackPanelExpanded(panelId: string, panelTitle: string) {
    this.trackActivity('panel_expanded', { panelId, panelTitle });
  }

  public trackSurveyDialogOpened(surveyId: number) {
    this.trackActivity('survey_dialog_opened', { surveyId });
  }

  public trackProfileEditOpened() {
    this.trackActivity('profile_edit_opened', {});
  }
}

// Create singleton instance
const analytics = new AnalyticsTracker();

export default analytics;