'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates = {
    full_name:           formData.get('full_name')         as string || null,
    preferred_name:      formData.get('preferred_name')    as string || null,
    birthday:            formData.get('birthday')          as string || null,
    phone:               formData.get('phone')             as string || null,
    preferred_email:     formData.get('preferred_email')   as string || null,
    address_line1:       formData.get('address_line1')     as string || null,
    address_line2:       formData.get('address_line2')     as string || null,
    city:                formData.get('city')              as string || null,
    state:               formData.get('state')             as string || null,
    zip:                 formData.get('zip')               as string || null,
    instagram_handle:    (formData.get('instagram_handle') as string || '').replace(/^@/, '') || null,
    facebook_handle:     (formData.get('facebook_handle')  as string || '').replace(/^@/, '') || null,
    opt_in_events_email: formData.get('opt_in_events_email') === 'on',
    opt_in_events_text:  formData.get('opt_in_events_text')  === 'on',
    opt_in_newsletter:   formData.get('opt_in_newsletter')   === 'on',
    updated_at:          new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updates });

  if (error) return { error: error.message };

  revalidatePath('/account/profile');
  revalidatePath('/account/dashboard');
  return { success: true };
}
