import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { appointment_id, notification_type } = await req.json()

    if (!appointment_id || !notification_type) {
      return new Response(
        JSON.stringify({ error: 'appointment_id and notification_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch appointment with customer and salon details
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(full_name, phone, email),
        salon:salons(name, phone, email),
        staff:staff(*, profile:profiles(full_name)),
        appointment_services(*, service:services(name))
      `)
      .eq('id', appointment_id)
      .single()

    if (aptError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const customer = appointment.customer
    const salon = appointment.salon
    const staffProfile = appointment.staff?.profile
    const services = appointment.appointment_services?.map((as: any) => as.service?.name).filter(Boolean).join(', ')

    // Build notification message
    let message = ''
    let subject = ''

    switch (notification_type) {
      case 'confirmation':
        subject = `Appointment Confirmed - ${salon?.name}`
        message = `Dear ${customer?.full_name},\n\nYour appointment at ${salon?.name} has been confirmed.\n\nDate: ${appointment.appointment_date}\nTime: ${appointment.start_time?.slice(0, 5)} - ${appointment.end_time?.slice(0, 5)}\nServices: ${services}\n${staffProfile?.full_name ? `Staff: ${staffProfile.full_name}` : ''}\n\nThank you for choosing ${salon?.name}!`
        break

      case 'reminder':
        subject = `Appointment Reminder - ${salon?.name}`
        message = `Dear ${customer?.full_name},\n\nThis is a reminder for your upcoming appointment at ${salon?.name}.\n\nDate: ${appointment.appointment_date}\nTime: ${appointment.start_time?.slice(0, 5)}\nServices: ${services}\n\nWe look forward to seeing you!`
        break

      case 'cancellation':
        subject = `Appointment Cancelled - ${salon?.name}`
        message = `Dear ${customer?.full_name},\n\nYour appointment at ${salon?.name} on ${appointment.appointment_date} at ${appointment.start_time?.slice(0, 5)} has been cancelled.\n\nIf you have any questions, please contact us at ${salon?.phone || 'our salon'}.`
        break

      case 'completion':
        subject = `Thank You - ${salon?.name}`
        message = `Dear ${customer?.full_name},\n\nThank you for visiting ${salon?.name}! We hope you enjoyed your services: ${services}.\n\nWe'd love to see you again soon!\nTotal Amount: ₹${appointment.total_amount || 0}`
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Log the notification (in production, integrate with SMS/email provider)
    const { error: logError } = await supabase
      .from('error_logs')
      .insert({
        error_type: 'notification',
        error_message: `${notification_type}: ${subject}`,
        error_stack: message,
        salon_id: appointment.salon_id,
        metadata: {
          appointment_id,
          notification_type,
          customer_phone: customer?.phone,
          customer_email: customer?.email,
          subject,
        },
      })

    if (logError) {
      console.error('Failed to log notification:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification processed',
        notification: { subject, message, to: { phone: customer?.phone, email: customer?.email } },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
