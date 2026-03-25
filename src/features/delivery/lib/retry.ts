export function getRetryDelayMinutes(nextRetryCount: number) {
  const schedule = [5, 15, 60];

  return schedule[Math.max(0, Math.min(nextRetryCount - 1, schedule.length - 1))] ?? 60;
}

export function buildNextRetryAt(
  nextRetryCount: number,
  now = new Date()
) {
  const retryDelayMinutes = getRetryDelayMinutes(nextRetryCount);

  return new Date(now.getTime() + retryDelayMinutes * 60 * 1000).toISOString();
}

export function canRetry(
  currentRetryCount: number,
  maxRetries: number
) {
  return currentRetryCount < maxRetries;
}
