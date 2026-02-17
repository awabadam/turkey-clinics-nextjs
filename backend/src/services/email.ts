import nodemailer from 'nodemailer';
import { Booking, Clinic } from '@prisma/client';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendBookingConfirmation(to: string, booking: Booking, clinic: Clinic) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: `Booking Confirmation - ${clinic.name}`,
        html: `
          <h1>Booking Confirmation</h1>
          <p>Dear ${booking.name},</p>
          <p>Your booking request for <strong>${clinic.name}</strong> has been received.</p>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li>Clinic: ${clinic.name}</li>
            <li>Status: ${booking.status}</li>
            <li>Date: ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>The clinic will contact you shortly.</p>
          <p>Best regards,<br>Turkey Clinic Guide</p>
        `,
      });
      console.log(`Booking confirmation sent to ${to}`);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  }

  async sendNewLeadNotification(to: string, booking: Booking, clinic: Clinic) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: `New Lead: ${booking.name}`,
        html: `
          <h1>New Booking Request</h1>
          <p>You have a new lead for <strong>${clinic.name}</strong>.</p>
          <p><strong>Lead Details:</strong></p>
          <ul>
            <li>Name: ${booking.name}</li>
            <li>Email: ${booking.email}</li>
            <li>Phone: ${booking.phone}</li>
            <li>Message: ${booking.message || 'No message provided'}</li>
          </ul>
          <p>Please log in to the dashboard to manage this booking.</p>
        `,
      });
      console.log(`New lead notification sent to ${to}`);
    } catch (error) {
      console.error('Error sending lead notification:', error);
    }
  }
}

export const emailService = new EmailService();
