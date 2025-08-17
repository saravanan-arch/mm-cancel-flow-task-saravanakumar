export interface MockSubscription {
  id: string;
  user_id: string;
  monthly_price: number; // in cents
  status: 'active' | 'pending_cancellation' | 'cancelled';
  offer_percent: number;
  offer_accepted: boolean;
  offer_accepted_at?: string;
  offer_declined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingInfo {
  originalPrice: number; // in dollars
  offerPrice: number; // in dollars
  offerPercent: number;
  nextBillingDate: Date;
  daysRemaining: number;
  billingCycle: string;
}

export class SubscriptionService {
  // Mock subscription data matching the database schema
  private static mockSubscriptions: MockSubscription[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      monthly_price: 2500, // $25.00
      status: 'active',
      offer_percent: 0, // No longer percentage-based, now $10 off
      offer_accepted: false,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      updated_at: new Date().toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      monthly_price: 2900, // $29.00
      status: 'active',
      offer_percent: 0, // No longer percentage-based, now $10 off
      offer_accepted: false,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      updated_at: new Date().toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      monthly_price: 2500, // $25.00
      status: 'active',
      offer_percent: 0, // No longer percentage-based, now $10 off
      offer_accepted: false,
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
      updated_at: new Date().toISOString()
    }
  ];

  /**
   * Get subscription by user ID
   */
  static getSubscriptionByUserId(userId: string): MockSubscription | null {
    return this.mockSubscriptions.find(sub => sub.user_id === userId) || null;
  }

  /**
   * Get subscription by ID
   */
  static getSubscriptionById(subscriptionId: string): MockSubscription | null {
    return this.mockSubscriptions.find(sub => sub.id === subscriptionId) || null;
  }

  /**
   * Calculate billing information for a subscription
   */
  static calculateBillingInfo(subscription: MockSubscription): BillingInfo {
    const originalPrice = subscription.monthly_price / 100; // Convert cents to dollars
    const offerAmount = 10; // Fixed $10 off
    const finalPrice = originalPrice - offerAmount;

    // Calculate next billing date (30 days from created_at)
    const createdDate = new Date(subscription.created_at);
    const nextBillingDate = new Date(createdDate);
    nextBillingDate.setDate(createdDate.getDate() + 30);

    // Calculate days remaining until next billing
    const now = new Date();
    const daysRemaining = Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine billing cycle
    const daysSinceCreation = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const billingCycle = daysSinceCreation <= 30 ? 'first' : 'recurring';

    return {
      originalPrice,
      offerPrice: finalPrice,
      offerPercent: 0, // No longer percentage-based
      nextBillingDate,
      daysRemaining: Math.max(0, daysRemaining),
      billingCycle
    };
  }

  /**
   * Format price for display
   */
  static formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toFixed(2)}`;
  }

  /**
   * Format price with $10 off offer applied
   */
  static formatOfferPrice(originalPrice: number): string {
    const offerAmount = 10; // Fixed $10 off
    const finalPrice = originalPrice - offerAmount;
    return `$${finalPrice.toFixed(2)}`;
  }

  /**
   * Get offer display text
   */
  static getOfferDisplayText(subscription: MockSubscription): string {
    const billingInfo = this.calculateBillingInfo(subscription);
    const originalPrice = this.formatPrice(subscription.monthly_price);
    const offerPrice = this.formatOfferPrice(subscription.monthly_price / 100);
    
    return `${offerPrice}/month until you find a job ($10 off ${originalPrice})`;
  }

  /**
   * Get continue subscription description with dynamic data
   */
  static getContinueSubscriptionDescription(subscription: MockSubscription): string {
    const billingInfo = this.calculateBillingInfo(subscription);
    const originalPrice = this.formatPrice(subscription.monthly_price);
    const offerPrice = this.formatOfferPrice(subscription.monthly_price / 100);
    
    return `Great choice! You've accepted our $10 off offer. Your subscription will continue at ${offerPrice}/month (originally ${originalPrice}/month) until you find a job. Your next billing date is ${billingInfo.nextBillingDate.toLocaleDateString()} (${billingInfo.daysRemaining} days from now).`;
  }

  /**
   * Update subscription offer status
   */
  static updateSubscriptionOffer(subscriptionId: string, offerAccepted: boolean): boolean {
    const subscription = this.mockSubscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      subscription.offer_accepted = offerAccepted;
      subscription.updated_at = new Date().toISOString();
      
      if (offerAccepted) {
        subscription.offer_accepted_at = new Date().toISOString();
        subscription.offer_declined_at = undefined;
      } else {
        subscription.offer_declined_at = new Date().toISOString();
        subscription.offer_accepted_at = undefined;
      }
      
      return true;
    }
    return false;
  }

  /**
   * Replace variables in text with actual subscription data
   * Supports variables like ${created_date}, ${monthly_price}, ${remaining_days}, etc.
   */
  static replaceVariablesInText(text: string, subscription: MockSubscription | null): string {
    if (!subscription || !text) {
      return text;
    }

    const billingInfo = this.calculateBillingInfo(subscription);
    
    // Define variable mappings
    const variables: Record<string, string> = {
      // Basic subscription data
      '${monthly_price}': this.formatPrice(subscription.monthly_price),
      '${offer_percent}': subscription.offer_percent.toString(),
      '${status}': subscription.status,
      '${created_date}': new Date(subscription.created_at).toLocaleDateString(),
      '${updated_date}': new Date(subscription.updated_at).toLocaleDateString(),
      
      // Calculated billing data
      '${remaining_days}': billingInfo.daysRemaining.toString(),
      '${next_billing_date}': billingInfo.nextBillingDate.toLocaleDateString(),
      '${billing_cycle}': billingInfo.billingCycle,
      
      // Price calculations
      '${original_price}': this.formatPrice(subscription.monthly_price),
      '${offer_price}': this.formatOfferPrice(subscription.monthly_price/100),
      '${final_price}': this.formatPrice(subscription.monthly_price - 10), // Fixed $10 off
      
      // Legacy variables (for backward compatibility)
      '${XX}': billingInfo.daysRemaining.toString(),
      '${MM/DD/YYYY}': billingInfo.nextBillingDate.toLocaleDateString(),
      '${Price}': this.formatOfferPrice(subscription.monthly_price), // This variable is no longer percentage-based
      '{{endDate}}': billingInfo.nextBillingDate.toLocaleDateString(),
      
      // Additional calculated fields
      '${days_since_creation}': Math.ceil((new Date().getTime() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24)).toString(),
      '${next_billing_days}': billingInfo.daysRemaining.toString(),
      '${subscription_age}': Math.ceil((new Date().getTime() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24)).toString()
    };

    // Replace all variables in the text
    let result = text;
    Object.entries(variables).forEach(([variable, value]) => {
      result = result.replace(new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    return result;
  }

  /**
   * Get all available variables for a subscription (for debugging/development)
   */
  static getAvailableVariables(subscription: MockSubscription | null): Record<string, string> {
    if (!subscription) {
      return {};
    }

    const billingInfo = this.calculateBillingInfo(subscription);
    
    return {
      // Basic subscription data
      '${monthly_price}': this.formatPrice(subscription.monthly_price),
      '${offer_percent}': subscription.offer_percent.toString(),
      '${status}': subscription.status,
      '${created_date}': new Date(subscription.created_at).toLocaleDateString(),
      '${updated_date}': new Date(subscription.updated_at).toLocaleDateString(),
      
      // Calculated billing data
      '${remaining_days}': billingInfo.daysRemaining.toString(),
      '${next_billing_date}': billingInfo.nextBillingDate.toLocaleDateString(),
      '${billing_cycle}': billingInfo.billingCycle,
      
      // Price calculations
      '${original_price}': this.formatPrice(subscription.monthly_price),
      '${offer_price}': this.formatOfferPrice(subscription.monthly_price), // This variable is no longer percentage-based
      '${final_price}': this.formatPrice(subscription.monthly_price - 10), // Fixed $10 off
      
      // Legacy variables
      '${XX}': billingInfo.daysRemaining.toString(),
      '${MM/DD/YYYY}': billingInfo.nextBillingDate.toLocaleDateString(),
      '${Price}': this.formatOfferPrice(subscription.monthly_price), // This variable is no longer percentage-based
      '{{endDate}}': billingInfo.nextBillingDate.toLocaleDateString(),
      
      // Additional calculated fields
      '${days_since_creation}': Math.ceil((new Date().getTime() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24)).toString(),
      '${next_billing_days}': billingInfo.daysRemaining.toString(),
      '${subscription_age}': Math.ceil((new Date().getTime() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24)).toString()
    };
  }
}
