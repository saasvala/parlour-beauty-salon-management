-- =====================================================
-- PHASE 1: DB HARDENING — FKs, indexes, triggers, storage
-- =====================================================

-- ---------- Foreign Key constraints (idempotent) ----------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_services_appointment_id_fkey') THEN
    ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_services_service_id_fkey') THEN
    ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_services_staff_id_fkey') THEN
    ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_salon_id_fkey') THEN
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_branch_id_fkey') THEN
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_customer_id_fkey') THEN
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_staff_id_fkey') THEN
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branches_salon_id_fkey') THEN
    ALTER TABLE public.branches ADD CONSTRAINT branches_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_salon_id_fkey') THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_salon_id_fkey') THEN
    ALTER TABLE public.expenses ADD CONSTRAINT expenses_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_branch_id_fkey') THEN
    ALTER TABLE public.expenses ADD CONSTRAINT expenses_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_salon_id_fkey') THEN
    ALTER TABLE public.inventory ADD CONSTRAINT inventory_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_branch_id_fkey') THEN
    ALTER TABLE public.inventory ADD CONSTRAINT inventory_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_category_id_fkey') THEN
    ALTER TABLE public.inventory ADD CONSTRAINT inventory_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.inventory_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_categories_salon_id_fkey') THEN
    ALTER TABLE public.inventory_categories ADD CONSTRAINT inventory_categories_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_transactions_inventory_id_fkey') THEN
    ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_appointment_id_fkey') THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_salon_id_fkey') THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'package_services_package_id_fkey') THEN
    ALTER TABLE public.package_services ADD CONSTRAINT package_services_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'package_services_service_id_fkey') THEN
    ALTER TABLE public.package_services ADD CONSTRAINT package_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'packages_salon_id_fkey') THEN
    ALTER TABLE public.packages ADD CONSTRAINT packages_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_packages_customer_id_fkey') THEN
    ALTER TABLE public.customer_packages ADD CONSTRAINT customer_packages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_packages_package_id_fkey') THEN
    ALTER TABLE public.customer_packages ADD CONSTRAINT customer_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_appointment_id_fkey') THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_salon_id_fkey') THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_salon_id_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_customer_id_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_appointment_id_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'salons_subscription_plan_id_fkey') THEN
    ALTER TABLE public.salons ADD CONSTRAINT salons_subscription_plan_id_fkey FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_salon_id_fkey') THEN
    ALTER TABLE public.service_categories ADD CONSTRAINT service_categories_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_salon_id_fkey') THEN
    ALTER TABLE public.services ADD CONSTRAINT services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_category_id_fkey') THEN
    ALTER TABLE public.services ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_salon_id_fkey') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_branch_id_fkey') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_attendance_staff_id_fkey') THEN
    ALTER TABLE public.staff_attendance ADD CONSTRAINT staff_attendance_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_services_staff_id_fkey') THEN
    ALTER TABLE public.staff_services ADD CONSTRAINT staff_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_services_service_id_fkey') THEN
    ALTER TABLE public.staff_services ADD CONSTRAINT staff_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey') THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ---------- Indexes for hot query paths ----------
CREATE INDEX IF NOT EXISTS idx_appointments_salon_date ON public.appointments(salon_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appt_services_appt ON public.appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appt_services_staff ON public.appointment_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon ON public.customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_user ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(salon_id, phone);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON public.staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_services_salon ON public.services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_invoices_salon ON public.invoices(salon_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appt ON public.invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_appt ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_salon ON public.payments(salon_id);
CREATE INDEX IF NOT EXISTS idx_expenses_salon_date ON public.expenses(salon_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_inventory_salon ON public.inventory(salon_id);
CREATE INDEX IF NOT EXISTS idx_branches_salon ON public.branches(salon_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_salon ON public.reviews(salon_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_salon ON public.error_logs(salon_id, created_at DESC);

-- ---------- updated_at triggers (where missing) ----------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.column_name='updated_at'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class cls ON t.tgrelid = cls.oid
      WHERE cls.relname = r.table_name AND t.tgname = 'set_updated_at_' || r.table_name
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
        'set_updated_at_' || r.table_name, r.table_name
      );
    END IF;
  END LOOP;
END $$;

-- ---------- Validation triggers (avoid CHECK on time-based logic) ----------
CREATE OR REPLACE FUNCTION public.validate_appointment()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Appointment end_time must be after start_time';
  END IF;
  IF NEW.total_amount IS NOT NULL AND NEW.total_amount < 0 THEN
    RAISE EXCEPTION 'total_amount cannot be negative';
  END IF;
  IF NEW.discount_amount IS NOT NULL AND NEW.discount_amount < 0 THEN
    RAISE EXCEPTION 'discount_amount cannot be negative';
  END IF;
  IF NEW.final_amount IS NOT NULL AND NEW.final_amount < 0 THEN
    RAISE EXCEPTION 'final_amount cannot be negative';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS validate_appointment_trg ON public.appointments;
CREATE TRIGGER validate_appointment_trg BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_appointment();

CREATE OR REPLACE FUNCTION public.validate_positive_amount()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.amount IS NOT NULL AND NEW.amount < 0 THEN
    RAISE EXCEPTION 'amount cannot be negative';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS validate_payment_amount ON public.payments;
CREATE TRIGGER validate_payment_amount BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.validate_positive_amount();

DROP TRIGGER IF EXISTS validate_expense_amount ON public.expenses;
CREATE TRIGGER validate_expense_amount BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.validate_positive_amount();

CREATE OR REPLACE FUNCTION public.validate_invoice()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.subtotal < 0 OR NEW.total_amount < 0 OR COALESCE(NEW.paid_amount,0) < 0 THEN
    RAISE EXCEPTION 'invoice amounts cannot be negative';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_invoice_trg ON public.invoices;
CREATE TRIGGER validate_invoice_trg BEFORE INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.validate_invoice();

-- Ensure handle_new_user trigger exists on auth.users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ---------- Storage buckets ----------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('salon-logos', 'salon-logos', true),
  ('avatars', 'avatars', true),
  ('service-images', 'service-images', true),
  ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Public read on public buckets
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read public buckets') THEN
    CREATE POLICY "Public read public buckets" ON storage.objects FOR SELECT
      USING (bucket_id IN ('salon-logos','avatars','service-images'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated upload public buckets') THEN
    CREATE POLICY "Authenticated upload public buckets" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id IN ('salon-logos','avatars','service-images') AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated update own public files') THEN
    CREATE POLICY "Authenticated update own public files" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id IN ('salon-logos','avatars','service-images') AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated delete own public files') THEN
    CREATE POLICY "Authenticated delete own public files" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id IN ('salon-logos','avatars','service-images') AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- expense-receipts: salon members only (folder name = salon_id)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Salon members read receipts') THEN
    CREATE POLICY "Salon members read receipts" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'expense-receipts' AND (storage.foldername(name))[1]::uuid = ANY (public.get_user_salon_ids(auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Salon members upload receipts') THEN
    CREATE POLICY "Salon members upload receipts" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'expense-receipts' AND (storage.foldername(name))[1]::uuid = ANY (public.get_user_salon_ids(auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Salon members delete receipts') THEN
    CREATE POLICY "Salon members delete receipts" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'expense-receipts' AND (storage.foldername(name))[1]::uuid = ANY (public.get_user_salon_ids(auth.uid())));
  END IF;
END $$;
