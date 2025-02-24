//ngrox or localtunnel-lt --port 3000
//41.90.172.197

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_KEY;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please provide a WEBHOOK key in your environment variables'
    );
  }

  //extract headers and payload from svix

  const headerPayload = headers();

  const svix_id = (await headerPayload).get('svix-id');
  const svix_timestamp = (await headerPayload).get('svix-timestamp');
  const svix_signature = (await headerPayload).get('svix-signature');
  // These were all sent from the server

  if (svix_id || svix_timestamp || svix_signature) {
    throw new Error('Please provide a svix header');
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Process the event
  const { id } = evt.data;
  const eventType = evt.type;

  //logs the event

  if (eventType === 'user.created') {
    const { email_addresses, primary_email_address_id } = evt.data;
  }

  try {
    // Safely find the primary email address optional
    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    );
    console.log('Primary email:', primaryEmail);
    console.log('Email addresses:', primaryEmail?.email_address);

    if (!primaryEmail) {
      console.error('No primary email found');
      return new Response('No primary email found', { status: 400 });

      const primaryId = primaryEmail.find(
        (id) => id === primary_email_address_id
      );
      console.log('Primary email id:', primaryId);
    }

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        id: evt.data.id!,
        email: primaryEmail.email_address,
        isSubscribed: false, // Default setting
      },
    });
    console.log('New user created:', newUser);
  } catch (error) {
    console.error('Error creating user in database:', error);
    return new Response('Error creating user', { status: 500 });
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
