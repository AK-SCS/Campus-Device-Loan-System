
import { WaitlistRepo } from '../domain/waitlist-repo.js';
import { createWaitlistEntry, CreateWaitlistInput } from '../domain/waitlist.js';

export async function joinWaitlist(
  repo: WaitlistRepo,
  input: CreateWaitlistInput
) {

  const existingEntries = await repo.getByUserId(input.userId);
  const alreadyOnWaitlist = existingEntries.some(
    entry => entry.deviceId === input.deviceId && !entry.notified
  );

  if (alreadyOnWaitlist) {
    throw new Error('You are already on the waitlist for this device');
  }

  const waitlist = createWaitlistEntry(input);
  const saved = await repo.save(waitlist);

  return saved;
}
