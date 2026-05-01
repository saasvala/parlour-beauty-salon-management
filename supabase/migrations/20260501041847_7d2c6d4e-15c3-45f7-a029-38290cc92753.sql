-- Harden SECURITY DEFINER helpers: revoke EXECUTE from anon (public)
-- Keep authenticated EXECUTE since these helpers power RLS predicates safely.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_salon_ids(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_belongs_to_salon(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_salon_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_belongs_to_salon(uuid, uuid) TO authenticated;

-- Allow customers to delete their own notifications (UI marks read; deletions also useful)
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (user_id = auth.uid());

-- Ensure profiles auto-creation trigger exists (handle_new_user is defined but trigger may be missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure validation triggers are attached (they are defined but may not be wired up)
DROP TRIGGER IF EXISTS validate_appointment_trigger ON public.appointments;
CREATE TRIGGER validate_appointment_trigger
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_appointment();

DROP TRIGGER IF EXISTS validate_payment_amount_trigger ON public.payments;
CREATE TRIGGER validate_payment_amount_trigger
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.validate_positive_amount();

DROP TRIGGER IF EXISTS validate_invoice_trigger ON public.invoices;
CREATE TRIGGER validate_invoice_trigger
BEFORE INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.validate_invoice();

-- Wire updated_at triggers to commonly mutated tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'salons','profiles','customers','staff','services','service_categories',
      'appointments','payments','invoices','expenses','inventory','packages',
      'branches'
    ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      t, t
    );
  END LOOP;
END $$;
