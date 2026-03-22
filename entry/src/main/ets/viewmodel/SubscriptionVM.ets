import { Subscription } from '../model/Subscription';

@Observed
export class SubscriptionVM {
  subscriptions: Subscription[] = [];
  activeSubscriptionId: string = '';
  isLoading: boolean = false;
  error: string = '';

  get activeSubscription(): Subscription | undefined {
    return this.subscriptions.find((s: Subscription): boolean => s.id === this.activeSubscriptionId);
  }

  get hasSubscriptions(): boolean {
    return this.subscriptions.length > 0;
  }

  setSubscriptions(subs: Subscription[]): void {
    this.subscriptions = subs;
  }

  setActive(subscriptionId: string): void {
    this.activeSubscriptionId = subscriptionId;
  }

  addSubscription(sub: Subscription): void {
    this.subscriptions = [...this.subscriptions, sub];
  }

  removeSubscription(subscriptionId: string): void {
    this.subscriptions = this.subscriptions.filter((s: Subscription): boolean => s.id !== subscriptionId);
    if (this.activeSubscriptionId === subscriptionId) {
      this.activeSubscriptionId = this.subscriptions.length > 0 ? this.subscriptions[0].id : '';
    }
  }

  updateSubscription(updated: Subscription): void {
    const index = this.subscriptions.findIndex((s: Subscription): boolean => s.id === updated.id);
    if (index >= 0) {
      const copy = [...this.subscriptions];
      copy[index] = updated;
      this.subscriptions = copy;
    }
  }

  formatTrafficUsage(sub: Subscription): string {
    if (sub.trafficUsed === undefined || sub.trafficTotal === undefined || sub.trafficTotal === 0) {
      return '';
    }
    const usedGB = (sub.trafficUsed / (1024 * 1024 * 1024)).toFixed(1);
    const totalGB = (sub.trafficTotal / (1024 * 1024 * 1024)).toFixed(1);
    const percent = Math.round((sub.trafficUsed / sub.trafficTotal) * 100);
    return `${usedGB} / ${totalGB} GB (${percent}% used)`;
  }

  formatExpiry(sub: Subscription): string {
    if (!sub.expiresAt) return '';
    const date = new Date(sub.expiresAt);
    return `Expires: ${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}
