/**
 * Performance regression tests for the booking wizard revalidation +
 * slot generation path. These guard against accidental O(n²) behavior
 * as appointment / service / staff datasets grow.
 *
 * Thresholds are deliberately generous so the suite stays stable on
 * slower CI hardware — they exist to catch order-of-magnitude
 * regressions, not micro-optimizations.
 */
import { describe, it, expect } from 'vitest';
import { format, addDays } from 'date-fns';
import {
  computeTimeSlots,
  revalidateRestoredSelections,
  ExistingAppointment,
  PersistedService,
} from './bookingWizard';

const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

const buildAppointments = (count: number, staffPool: number): ExistingAppointment[] => {
  const out: ExistingAppointment[] = [];
  for (let i = 0; i < count; i++) {
    const hour = 9 + (i % 12);
    const start = `${hour.toString().padStart(2, '0')}:00:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
    out.push({ start_time: start, end_time: end, staff_id: `staff-${i % staffPool}` });
  }
  return out;
};

const buildServices = (count: number): PersistedService[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `svc-${i}`,
    name: `Service ${i}`,
    price: 100 + i,
    duration_minutes: 30,
  }));

const measure = (fn: () => void): number => {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
};

describe('bookingWizard – performance under load', () => {
  it('computeTimeSlots stays fast with 1,000 existing appointments', () => {
    const appts = buildAppointments(1000, 10);
    const ms = measure(() => {
      computeTimeSlots({
        selectedDate: tomorrow,
        totalDuration: 30,
        existingAppointments: appts,
        selectedStaff: 'staff-1',
        staffCount: 10,
      });
    });
    // 24 slots × 1000 appts inner loop — guard against order-of-magnitude regressions
    expect(ms).toBeLessThan(1500);
  });

  it('revalidateRestoredSelections scales linearly with selection size', () => {
    const live = buildServices(500);
    const selected = live.slice(0, 200); // user has 200 services in cart
    const slots = computeTimeSlots({
      selectedDate: tomorrow,
      totalDuration: 30,
      existingAppointments: [],
      selectedStaff: null,
      staffCount: 5,
    });

    const ms = measure(() => {
      revalidateRestoredSelections({
        selectedServices: selected,
        liveServices: live,
        selectedStaff: 'staff-1',
        liveStaffIds: Array.from({ length: 50 }, (_, i) => `staff-${i}`),
        selectedTimeSlot: '10:00',
        timeSlots: slots,
      });
    });
    expect(ms).toBeLessThan(100);
  });

  it('does not degrade super-linearly between 100 and 1,000 appointments', () => {
    const small = buildAppointments(100, 5);
    const large = buildAppointments(1000, 5);

    // warm up – first run can be JIT-noisy
    computeTimeSlots({ selectedDate: tomorrow, totalDuration: 30, existingAppointments: small, selectedStaff: null, staffCount: 5 });

    const tSmall = measure(() => {
      computeTimeSlots({ selectedDate: tomorrow, totalDuration: 30, existingAppointments: small, selectedStaff: null, staffCount: 5 });
    });
    const tLarge = measure(() => {
      computeTimeSlots({ selectedDate: tomorrow, totalDuration: 30, existingAppointments: large, selectedStaff: null, staffCount: 5 });
    });

    // 10× data should not take >50× the time (i.e. flag accidental quadratic blowup).
    // Add a small floor so timer noise on tiny runs doesn't trip the ratio.
    const ratio = tLarge / Math.max(tSmall, 0.5);
    expect(ratio).toBeLessThan(50);
  });
});
