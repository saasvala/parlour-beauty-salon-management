import { describe, it, expect, beforeEach } from 'vitest';
import { format, addDays } from 'date-fns';
import {
  STORAGE_KEY_PREFIX,
  storageKeyFor,
  saveWizardState,
  loadWizardState,
  clearWizardState,
  computeTimeSlots,
  revalidateRestoredSelections,
  PersistedService,
  PersistedWizardState,
} from './bookingWizard';

// Lightweight in-memory Storage so tests don't depend on jsdom localStorage state
const makeStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  } as Storage;
};

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

const userId = 'user-123';

const baseService: PersistedService = {
  id: 'svc-haircut',
  name: 'Haircut',
  price: 500,
  duration_minutes: 30,
};

const baseState = (overrides: Partial<PersistedWizardState> = {}): PersistedWizardState => ({
  step: 4,
  selectedDate: tomorrow,
  selectedServices: [baseService],
  selectedStaff: 'staff-1',
  selectedTimeSlot: '10:00',
  ...overrides,
});

describe('bookingWizard – persistence (Step 1→4 refresh)', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = makeStorage();
  });

  it('writes under the user-scoped key', () => {
    const ok = saveWizardState(userId, baseState(), storage);
    expect(ok).toBe(true);
    expect(storage.getItem(storageKeyFor(userId))).toContain('"step":4');
    expect(storageKeyFor(userId)).toBe(`${STORAGE_KEY_PREFIX}${userId}`);
  });

  it('round-trips full Step 1–4 selections after a simulated refresh', () => {
    const state = baseState({
      step: 4,
      selectedServices: [baseService, { ...baseService, id: 'svc-spa', name: 'Spa', price: 1500, duration_minutes: 60 }],
      selectedStaff: 'staff-7',
      selectedTimeSlot: '14:30',
    });
    saveWizardState(userId, state, storage);

    // Simulate a hard refresh — only storage survives
    const restored = loadWizardState(userId, storage);
    expect(restored).toEqual(state);
    expect(restored?.selectedServices).toHaveLength(2);
    expect(restored?.selectedTimeSlot).toBe('14:30');
  });

  it('drops persisted state whose date is in the past', () => {
    const stale = baseState({ selectedDate: '2000-01-01' });
    saveWizardState(userId, stale, storage);
    expect(loadWizardState(userId, storage, today)).toBeNull();
  });

  it('returns null for unknown users and ignores corrupted JSON', () => {
    expect(loadWizardState(userId, storage)).toBeNull();
    storage.setItem(storageKeyFor(userId), '{not json');
    expect(loadWizardState(userId, storage)).toBeNull();
  });

  it('clearWizardState removes the entry (e.g. after successful booking)', () => {
    saveWizardState(userId, baseState(), storage);
    clearWizardState(userId, storage);
    expect(storage.getItem(storageKeyFor(userId))).toBeNull();
  });

  it('no-ops without a user id', () => {
    expect(saveWizardState(undefined, baseState(), storage)).toBe(false);
    expect(loadWizardState(undefined, storage)).toBeNull();
  });
});

describe('bookingWizard – time slot generation (Step 3 availability)', () => {
  it('marks slots that overlap an existing appointment as unavailable', () => {
    const slots = computeTimeSlots({
      selectedDate: tomorrow,
      totalDuration: 30,
      existingAppointments: [
        { start_time: '10:00:00', end_time: '11:00:00', staff_id: 'staff-1' },
      ],
      selectedStaff: 'staff-1',
      staffCount: 1,
    });
    const ten = slots.find((s) => s.time === '10:00')!;
    expect(ten.available).toBe(false);
    expect(ten.reason).toMatch(/Selected staff is already booked/);
  });

  it('keeps the slot available for a different staff member', () => {
    const slots = computeTimeSlots({
      selectedDate: tomorrow,
      totalDuration: 30,
      existingAppointments: [
        { start_time: '10:00:00', end_time: '11:00:00', staff_id: 'staff-1' },
      ],
      selectedStaff: 'staff-2',
      staffCount: 2,
    });
    expect(slots.find((s) => s.time === '10:00')?.available).toBe(true);
  });

  it('blocks a slot whose duration runs past closing time', () => {
    const slots = computeTimeSlots({
      selectedDate: tomorrow,
      totalDuration: 120,
      existingAppointments: [],
      selectedStaff: null,
      staffCount: 3,
      closeHour: 21,
    });
    const late = slots.find((s) => s.time === '20:00')!;
    expect(late.available).toBe(false);
    expect(late.reason).toMatch(/closing time/);
  });

  it('marks every slot in the day as unavailable when all staff are booked', () => {
    const slots = computeTimeSlots({
      selectedDate: tomorrow,
      totalDuration: 30,
      existingAppointments: [
        { start_time: '10:00:00', end_time: '11:00:00', staff_id: 'staff-1' },
        { start_time: '10:00:00', end_time: '11:00:00', staff_id: 'staff-2' },
      ],
      selectedStaff: null,
      staffCount: 2,
    });
    const ten = slots.find((s) => s.time === '10:00')!;
    expect(ten.available).toBe(false);
    expect(ten.reason).toBe('All staff members are booked during this time');
  });
});

describe('bookingWizard – Step 4 revalidation of restored selections', () => {
  const tenAm10min: PersistedService = { ...baseService };
  const liveSlots = [
    { time: '10:00', available: true },
    { time: '11:00', available: false, reason: 'Booked' },
  ];

  it('returns no issues when restored data still matches live data', () => {
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [tenAm10min],
      selectedStaff: 'staff-1',
      liveStaffIds: ['staff-1', 'staff-2'],
      selectedTimeSlot: '10:00',
      timeSlots: liveSlots,
    });
    expect(issues).toEqual([]);
  });

  it('flags services that no longer exist in the live catalog', () => {
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [],
      selectedStaff: null,
      liveStaffIds: [],
      selectedTimeSlot: '10:00',
      timeSlots: liveSlots,
    });
    expect(issues.some((m) => m.includes('no longer available'))).toBe(true);
    expect(issues.some((m) => m.includes('Haircut'))).toBe(true);
  });

  it('flags price or duration drift on still-existing services', () => {
    const drifted = { ...tenAm10min, price: 700 };
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [drifted],
      selectedStaff: null,
      liveStaffIds: [],
      selectedTimeSlot: '10:00',
      timeSlots: liveSlots,
    });
    expect(issues.some((m) => m.startsWith('Price or duration changed'))).toBe(true);
  });

  it('flags a staff member who is no longer active', () => {
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [tenAm10min],
      selectedStaff: 'staff-removed',
      liveStaffIds: ['staff-1'],
      selectedTimeSlot: '10:00',
      timeSlots: liveSlots,
    });
    expect(issues).toContain('The previously selected staff member is no longer available.');
  });

  it('flags a time slot that has since become unavailable', () => {
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [tenAm10min],
      selectedStaff: null,
      liveStaffIds: [],
      selectedTimeSlot: '11:00',
      timeSlots: liveSlots,
    });
    expect(issues.some((m) => m.includes('11:00 is no longer available'))).toBe(true);
  });

  it('flags a time slot that no longer appears in the offered grid', () => {
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [tenAm10min],
      selectedStaff: null,
      liveStaffIds: [],
      selectedTimeSlot: '23:30',
      timeSlots: liveSlots,
    });
    expect(issues).toContain('The previously selected time slot is no longer offered.');
  });

  it('flags missing time slot selection', () => {
    const issues = revalidateRestoredSelections({
      selectedServices: [tenAm10min],
      liveServices: [tenAm10min],
      selectedStaff: null,
      liveStaffIds: [],
      selectedTimeSlot: null,
      timeSlots: liveSlots,
    });
    expect(issues).toContain('No time slot is selected.');
  });
});

describe('bookingWizard – end-to-end Step 1→4 flow', () => {
  it('persists between steps and surfaces zero issues on a healthy refresh', () => {
    const storage = makeStorage();

    // Step 1: pick services
    let state: PersistedWizardState = {
      step: 1,
      selectedDate: tomorrow,
      selectedServices: [baseService],
      selectedStaff: null,
      selectedTimeSlot: null,
    };
    saveWizardState(userId, state, storage);

    // Step 2: pick staff
    state = { ...state, step: 2, selectedStaff: 'staff-1' };
    saveWizardState(userId, state, storage);

    // Step 3: pick a time slot validated against the live grid
    const slots = computeTimeSlots({
      selectedDate: tomorrow,
      totalDuration: state.selectedServices.reduce((s, x) => s + x.duration_minutes, 0),
      existingAppointments: [],
      selectedStaff: state.selectedStaff,
      staffCount: 1,
    });
    const firstAvail = slots.find((s) => s.available)!;
    state = { ...state, step: 3, selectedTimeSlot: firstAvail.time };
    saveWizardState(userId, state, storage);

    // Step 4: refresh — load from storage and revalidate
    state = { ...state, step: 4 };
    saveWizardState(userId, state, storage);
    const restored = loadWizardState(userId, storage)!;
    expect(restored.step).toBe(4);
    expect(restored.selectedTimeSlot).toBe(firstAvail.time);

    const issues = revalidateRestoredSelections({
      selectedServices: restored.selectedServices,
      liveServices: [baseService],
      selectedStaff: restored.selectedStaff,
      liveStaffIds: ['staff-1'],
      selectedTimeSlot: restored.selectedTimeSlot,
      timeSlots: slots,
    });
    expect(issues).toEqual([]);

    // Booking succeeds → wizard cleared
    clearWizardState(userId, storage);
    expect(loadWizardState(userId, storage)).toBeNull();
  });

  it('blocks confirmation when the staff was deactivated between Step 3 and a refresh on Step 4', () => {
    const storage = makeStorage();
    const state = baseState({ selectedStaff: 'staff-1', selectedTimeSlot: '10:00' });
    saveWizardState(userId, state, storage);

    const restored = loadWizardState(userId, storage)!;
    const slots = computeTimeSlots({
      selectedDate: restored.selectedDate,
      totalDuration: 30,
      existingAppointments: [],
      selectedStaff: restored.selectedStaff,
      staffCount: 0, // staff list now empty
    });
    const issues = revalidateRestoredSelections({
      selectedServices: restored.selectedServices,
      liveServices: [baseService],
      selectedStaff: restored.selectedStaff,
      liveStaffIds: [], // no longer present
      selectedTimeSlot: restored.selectedTimeSlot,
      timeSlots: slots,
    });
    expect(issues).toContain('The previously selected staff member is no longer available.');
  });
});
