/**
 * Time-zone & DST awareness for the booking wizard.
 *
 * Slot times are stored as wall-clock strings (HH:mm) in the salon's
 * local timezone, and `selectedDate` is a yyyy-MM-dd calendar date.
 * These tests pin the system clock to specific moments around DST
 * transitions and across locales to make sure:
 *   1. "past date" dropping uses calendar-day comparison (not UTC).
 *   2. Slot generation always returns the full 24-slot grid regardless
 *      of the host's timezone offset.
 *   3. DST "spring forward" / "fall back" days don't duplicate or
 *      drop slots.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { format, addDays } from 'date-fns';
import {
  computeTimeSlots,
  loadWizardState,
  saveWizardState,
  PersistedWizardState,
} from './bookingWizard';

const makeStorage = (): Storage => {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => Array.from(m.keys())[i] ?? null,
    removeItem: (k) => { m.delete(k); },
    setItem: (k, v) => { m.set(k, v); },
  } as Storage;
};

const baseState = (date: string): PersistedWizardState => ({
  step: 4,
  selectedDate: date,
  selectedServices: [{ id: 's1', name: 'Cut', price: 100, duration_minutes: 30 }],
  selectedStaff: 'staff-1',
  selectedTimeSlot: '10:00',
});

describe('bookingWizard – timezone / DST awareness', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('drops "past" dates using calendar-day comparison, not UTC offset', () => {
    // Pin to early-morning local time on a specific day. A naive UTC-based
    // implementation would treat "yesterday" as "today" or vice versa for
    // users west of UTC. Our impl uses string comparison on yyyy-MM-dd
    // produced from the local clock, which is what we want.
    vi.setSystemTime(new Date('2026-03-08T01:30:00')); // local midnight-ish
    const storage = makeStorage();
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

    saveWizardState('u', baseState(yesterday), storage);
    expect(loadWizardState('u', storage, today)).toBeNull();

    saveWizardState('u', baseState(today), storage);
    expect(loadWizardState('u', storage, today)?.selectedDate).toBe(today);
  });

  it('still emits the full 24-slot grid on a US "spring forward" day', () => {
    // 2026-03-08 is the US DST start. Wall-clock skips 02:00→03:00, but
    // because we treat slot times as pure HH:mm labels (not UTC instants),
    // every label from 09:00 to 20:30 must still appear exactly once.
    vi.setSystemTime(new Date('2026-03-07T12:00:00'));
    const slots = computeTimeSlots({
      selectedDate: '2026-03-08',
      totalDuration: 30,
      existingAppointments: [],
      selectedStaff: null,
      staffCount: 3,
    });
    const labels = slots.map((s) => s.time);
    expect(labels).toHaveLength(24);
    expect(new Set(labels).size).toBe(24); // no duplicates from DST skew
    expect(labels[0]).toBe('09:00');
    expect(labels[labels.length - 1]).toBe('20:30');
  });

  it('still emits the full 24-slot grid on a US "fall back" day', () => {
    // 2026-11-01 is the US DST end. Wall-clock 01:00–02:00 happens twice.
    // Our slots are outside that window AND label-based, so we must still
    // produce 24 unique slots and not double-count any of them.
    vi.setSystemTime(new Date('2026-10-31T12:00:00'));
    const slots = computeTimeSlots({
      selectedDate: '2026-11-01',
      totalDuration: 60,
      existingAppointments: [],
      selectedStaff: null,
      staffCount: 1,
    });
    expect(slots).toHaveLength(24);
    expect(new Set(slots.map((s) => s.time)).size).toBe(24);
  });

  it('marks "already passed today" using local time, not UTC', () => {
    // Pin to 14:00 local. 13:00 should be in the past, 15:00 should not,
    // regardless of the host machine's UTC offset.
    vi.setSystemTime(new Date('2026-06-15T14:00:00'));
    const today = format(new Date(), 'yyyy-MM-dd');
    const slots = computeTimeSlots({
      selectedDate: today,
      totalDuration: 30,
      existingAppointments: [],
      selectedStaff: null,
      staffCount: 1,
    });
    const past = slots.find((s) => s.time === '13:00')!;
    const future = slots.find((s) => s.time === '15:00')!;
    expect(past.available).toBe(false);
    expect(past.reason).toMatch(/already passed/);
    expect(future.available).toBe(true);
  });

  it('does not flag "past today" when viewing a future date', () => {
    vi.setSystemTime(new Date('2026-06-15T20:00:00'));
    const future = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const slots = computeTimeSlots({
      selectedDate: future,
      totalDuration: 30,
      existingAppointments: [],
      selectedStaff: null,
      staffCount: 1,
    });
    expect(slots.every((s) => s.reason !== 'This time has already passed today')).toBe(true);
  });
});
