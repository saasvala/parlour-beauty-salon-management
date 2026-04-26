/**
 * Pure helpers backing the customer booking wizard (Steps 1–4).
 *
 * Extracted so the persistence + revalidation logic can be unit-tested
 * without mounting the full React component tree. The BookAppointment
 * page uses the same shapes inline; these helpers are a 1:1 mirror that
 * is also reused by the test suite.
 */

import { format, parse, addMinutes, isBefore, isAfter } from 'date-fns';

export const STORAGE_KEY_PREFIX = 'booking-wizard:';

export interface PersistedService {
  id: string;
  name: string;
  price: number;
  discounted_price?: number | null;
  duration_minutes: number;
}

export interface PersistedWizardState {
  step: number;
  selectedDate: string; // yyyy-MM-dd
  selectedServices: PersistedService[];
  selectedStaff: string | null;
  selectedTimeSlot: string | null; // HH:mm
}

export interface ExistingAppointment {
  start_time: string; // HH:mm or HH:mm:ss
  end_time: string;
  staff_id: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export const storageKeyFor = (userId: string) => STORAGE_KEY_PREFIX + userId;

/** Save wizard state. Returns true on success, false on failure. */
export const saveWizardState = (
  userId: string | undefined,
  state: PersistedWizardState,
  storage: Storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage),
): boolean => {
  if (!userId || !storage) return false;
  try {
    storage.setItem(storageKeyFor(userId), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

/** Load and validate persisted state. Past dates are dropped. */
export const loadWizardState = (
  userId: string | undefined,
  storage: Storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage),
  today: string = format(new Date(), 'yyyy-MM-dd'),
): PersistedWizardState | null => {
  if (!userId || !storage) return null;
  try {
    const raw = storage.getItem(storageKeyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWizardState;
    if (parsed?.selectedDate && parsed.selectedDate < today) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearWizardState = (
  userId: string | undefined,
  storage: Storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage),
): void => {
  if (!userId || !storage) return;
  try {
    storage.removeItem(storageKeyFor(userId));
  } catch {
    // ignore
  }
};

const toHHmm = (t: string) => t.slice(0, 5);

/**
 * Generate the same time-slot grid the booking wizard renders.
 * Mirrors BookAppointment.tsx exactly so tests assert identical behavior.
 */
export const computeTimeSlots = (params: {
  selectedDate: string;
  totalDuration: number;
  existingAppointments: ExistingAppointment[];
  selectedStaff: string | null;
  staffCount: number;
  now?: Date;
  openHour?: number;
  closeHour?: number;
}): TimeSlot[] => {
  const {
    selectedDate,
    totalDuration,
    existingAppointments,
    selectedStaff,
    staffCount,
    now = new Date(),
    openHour = 9,
    closeHour = 21,
  } = params;

  const slots: TimeSlot[] = [];
  const isToday = selectedDate === format(now, 'yyyy-MM-dd');

  for (let hour = openHour; hour < closeHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotStart = parse(timeStr, 'HH:mm', new Date());
      const slotEnd = addMinutes(slotStart, totalDuration || 30);

      let isAvailable = true;
      let reason: string | undefined;

      if (isToday && isBefore(slotStart, now)) {
        isAvailable = false;
        reason = 'This time has already passed today';
      }

      const closeDate = parse(`${closeHour}:00`, 'HH:mm', new Date());
      if (isAvailable && isAfter(slotEnd, closeDate)) {
        isAvailable = false;
        reason = `Service ends after closing time (${closeHour}:00)`;
      }

      if (isAvailable) {
        const overlapping = existingAppointments.filter((apt) => {
          const aptStart = parse(toHHmm(apt.start_time), 'HH:mm', new Date());
          const aptEnd = parse(toHHmm(apt.end_time), 'HH:mm', new Date());
          return (
            (isAfter(slotStart, aptStart) && isBefore(slotStart, aptEnd)) ||
            (isAfter(slotEnd, aptStart) && isBefore(slotEnd, aptEnd)) ||
            (isBefore(slotStart, aptStart) && isAfter(slotEnd, aptEnd)) ||
            format(slotStart, 'HH:mm') === format(aptStart, 'HH:mm')
          );
        });

        if (selectedStaff) {
          const conflict = overlapping.find((a) => a.staff_id === selectedStaff);
          if (conflict) {
            isAvailable = false;
            reason = `Selected staff is already booked from ${toHHmm(conflict.start_time)} to ${toHHmm(conflict.end_time)}`;
          }
        } else if (staffCount > 0) {
          const busyStaffIds = new Set(overlapping.map((a) => a.staff_id).filter(Boolean));
          if (busyStaffIds.size >= staffCount) {
            isAvailable = false;
            reason = 'All staff members are booked during this time';
          }
        }
      }

      slots.push({ time: timeStr, available: isAvailable, reason });
    }
  }

  return slots;
};

export interface RevalidationInput {
  selectedServices: PersistedService[];
  liveServices: PersistedService[];
  selectedStaff: string | null;
  liveStaffIds: string[];
  selectedTimeSlot: string | null;
  timeSlots: TimeSlot[];
}

/**
 * Re-check restored selections against freshly fetched data so a stale
 * booking can never be confirmed. Returns the same human-readable
 * messages surfaced to the user in Step 4.
 */
export const revalidateRestoredSelections = (input: RevalidationInput): string[] => {
  const issues: string[] = [];
  const liveServiceIds = new Set(input.liveServices.map((s) => s.id));

  const missingServices = input.selectedServices.filter((s) => !liveServiceIds.has(s.id));
  if (missingServices.length > 0) {
    issues.push(
      `${missingServices.length} selected service${missingServices.length > 1 ? 's are' : ' is'} no longer available: ${missingServices.map((s) => s.name).join(', ')}`,
    );
  }

  const drifted = input.selectedServices.filter((sel) => {
    const live = input.liveServices.find((s) => s.id === sel.id);
    if (!live) return false;
    const livePrice = live.discounted_price || live.price;
    const selPrice = sel.discounted_price || sel.price;
    return livePrice !== selPrice || live.duration_minutes !== sel.duration_minutes;
  });
  if (drifted.length > 0) {
    issues.push(`Price or duration changed for: ${drifted.map((s) => s.name).join(', ')}`);
  }

  if (input.selectedStaff && !input.liveStaffIds.includes(input.selectedStaff)) {
    issues.push('The previously selected staff member is no longer available.');
  }

  if (input.selectedTimeSlot) {
    const slot = input.timeSlots.find((s) => s.time === input.selectedTimeSlot);
    if (!slot) {
      issues.push('The previously selected time slot is no longer offered.');
    } else if (!slot.available) {
      issues.push(
        `Time slot ${input.selectedTimeSlot} is no longer available: ${slot.reason || 'taken'}.`,
      );
    }
  } else {
    issues.push('No time slot is selected.');
  }

  return issues;
};
