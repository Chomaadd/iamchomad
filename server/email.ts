import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured, skipping email notification.");
    return;
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: data.email,
    subject: `[Portfolio Chomad] Pesan baru dari ${data.name}: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-bottom: 4px;">Pesan Baru dari Portfolio</h2>
        <p style="color: #6b7280; margin-top: 0; margin-bottom: 24px; font-size: 14px;">Kamu mendapat pesan baru melalui form Contact.</p>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; width: 100px;">Nama</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 600;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;"><a href="mailto:${data.email}" style="color: #4f46e5;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Subjek</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${data.subject}</td>
          </tr>
        </table>

        <div style="margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Pesan:</p>
          <div style="background: #f9fafb; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 4px; color: #1f2937; white-space: pre-wrap;">${data.message}</div>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Kamu bisa balas email ini langsung untuk membalas ke ${data.name}.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
