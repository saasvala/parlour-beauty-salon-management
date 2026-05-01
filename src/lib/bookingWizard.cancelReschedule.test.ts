/**
 * End-to-end coverage for cancel + reschedule flows on top of the
 * booking wizard helpers. These exercise the same persistence and
 * revalidation primitives the UI uses, simulating:
 *   - cancelling an existing booking and clearing wizard state
 *   - rescheduling: loading an existing appointment into the wizard,
 *     surviving a refresh, and re-validating against new conflicts
 *
 * The wizard helpers are storage-agnostic (state is opaque JSON), so
 * we model the "appointment under edit" by seeding the wizard with
 * its current selections and excluding it from the live appointment
 * list (the way the real reschedule UI does to avoid self-conflicts).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { format, addDays } from 'date-fns';
import {
  saveWizardState,
  loadWizardState,
  clearWizardState,
  computeTimeSlots,
  revalidateRestoredSelections,
  PersistedWizardState,
  PersistedService,
  ExistingAppointment,
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

const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const userId = 'u-cancel';

const haircut: PersistedService = { id: 'svc-1', name: 'Haircut', price: 500, duration_minutes: 30 };

const seedReschedule = (storage: Storage, overrides: Partial<PersistedWizardState> = {}) => {
  const state: PersistedWizardState = {
    step: 4,
    selectedDate: tomorrow,
    selectedServices: [haircut],
    selectedStaff: 'staff-1',
    selectedTimeSlot: '10:00',
    ...overrides,
  };
  saveWizardState(userId, state, storage);
  return state;
};

describe('bookingWizard – cancel flow', () => {
  let storage: Storage;
  beforeEach(() => { storage = makeStorage(); });

  it('clears persisted wizard state when the user cancels mid-flow', () => {
    seedReschedule(storage);
    expect(loadWizardState(userId, storage)).not.toBeNull();
    clearWizardState(userId, storage);
    expect(loadWizardState(userId, storage)).toBeNull();
  });

  it('a cancelled appointment frees its slot for revalidation', () => {
    // Booking that *was* taking 10:00 with staff-1 – now cancelled, so the
    // live appointment list excludes it. The user's restored 10:00 pick
    // should now revalidate cleanly.
    const state = seedReschedule(storage);
    const slots = computeTimeSlots({
      selectedDate: state.selectedDate,
      totalDuration: 30,
      existingAppointments: [], // cancelled → not present
      selectedStaff: state.selectedStaff,
      staffCount: 1,
    });
    const issues = revalidateRestoredSelections({
      selectedServices: state.selectedServices,
      liveServices: [haircut],
      selectedStaff: state.selectedStaff,
      liveStaffIds: ['staff-1'],
      selectedTimeSlot: state.selectedTimeSlot,
      timeSlots: slots,
    });
    expect(issues).toEqual([]);
  });
});

describe('bookingWizard – reschedule flow', () => {
  let storage: Storage;
  beforeEach(() => { storage = makeStorage(); });

  it('survives a refresh while rescheduling and keeps the in-flight selection', () => {
    // User opens reschedule on an existing appointment, picks a new slot,
    // then refreshes the page. The wizard must rehydrate to step 4 with
    // the new slot intact.
    const state = seedReschedule(storage, { selectedTimeSlot: '15:30' });
    const restored = loadWizardState(userId, storage)!;
    expect(restored.step).toBe(4);
    expect(restored.selectedTimeSlot).toBe('15:30');
    expect(restored.selectedServices).toEqual(state.selectedServices);
  });

  it('flags a reschedule conflict when another booking takes the new slot first', () => {
    const state = seedReschedule(storage, { selectedTimeSlot: '11:00' });
    // Someone else booked 11:00 with staff-1 between the user starting
    // the reschedule and Step 4 reloading.
    const conflicting: ExistingAppointment[] = [
      { start_time: '11:00:00', end_time: '11:30:00', staff_id: 'staff-1' },
    ];
    const slots = computeTimeSlots({
      selectedDate: state.selectedDate,
      totalDuration: 30,
      existingAppointments: conflicting,
      selectedStaff: state.selectedStaff,
      staffCount: 1,
    });
    const issues = revalidateRestoredSelections({
      selectedServices: state.selectedServices,
      liveServices: [haircut],
      selectedStaff: state.selectedStaff,
      liveStaffIds: ['staff-1'],
      selectedTimeSlot: state.selectedTimeSlot,
      timeSlots: slots,
    });
    expect(issues.some((m) => m.includes('11:00 is no longer available'))).toBe(true);
  });

  it('treats the appointment-under-edit as not occupying its own slot', () => {
    // The reschedule UI excludes the edited appointment from the live
    // appointment list so the user is allowed to keep their current slot.
    // Verify that invariant: the selection revalidates clean even though
    // a same-time appointment "exists" if we DON'T exclude it.
    const state = seedReschedule(storage, { selectedTimeSlot: '10:00' });
    const slotsExcludingSelf = computeTimeSlots({
      selectedDate: state.selectedDate,
      totalDuration: 30,
      existingAppointments: [], // self excluded
      selectedStaff: state.selectedStaff,
      staffCount: 1,
    });
    expect(
      revalidateRestoredSelections({
        selectedServices: state.selectedServices,
        liveServices: [haircut],
        selectedStaff: state.selectedStaff,
        liveStaffIds: ['staff-1'],
        selectedTimeSlot: state.selectedTimeSlot,
        timeSlots: slotsExcludingSelf,
      }),
    ).toEqual([]);

    // Sanity check: forgetting to exclude self would (correctly) flag a conflict.
    const slotsIncludingSelf = computeTimeSlots({
      selectedDate: state.selectedDate,
      totalDuration: 30,
      existingAppointments: [
        { start_time: '10:00:00', end_time: '10:30:00', staff_id: 'staff-1' },
      ],
      selectedStaff: state.selectedStaff,
      staffCount: 1,
    });
    const selfBlockedIssues = revalidateRestoredSelections({
      selectedServices: state.selectedServices,
      liveServices: [haircut],
      selectedStaff: state.selectedStaff,
      liveStaffIds: ['staff-1'],
      selectedTimeSlot: state.selectedTimeSlot,
      timeSlots: slotsIncludingSelf,
    });
    expect(selfBlockedIssues.some((m) => m.includes('10:00 is no longer available'))).toBe(true);
  });

  it('clears wizard state once the reschedule is committed', () => {
    seedReschedule(storage, { selectedTimeSlot: '16:00' });
    // Simulate successful save
    clearWizardState(userId, storage);
    expect(loadWizardState(userId, storage)).toBeNull();
  });
});
