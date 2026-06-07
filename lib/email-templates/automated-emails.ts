export async function sendTemplateEmail(
  _template: string,
  _email: string,
  _vars: Record<string, string>,
  _options?: { recipientName?: string }
): Promise<void> {}

export async function scheduleEmail(
  _template: string,
  _email: string,
  _vars: Record<string, string>,
  _delayDays: number,
  _options?: { recipientName?: string }
): Promise<void> {}
