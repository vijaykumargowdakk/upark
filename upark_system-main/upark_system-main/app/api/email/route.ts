import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const res = await request.json();

  const { to, from, subject, text, attachment } = res;

  // Create a nodemailer transporter with your SMTP server details
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Set to true if using SSL/TLS
    auth: {
      user: "rvit21bis065.rvitm@rvei.edu.in",
      pass: "IllForgetItAnyways",
    },
  });

  // Create the email message
  const mailOptions = {
    from,
    to,
    subject,
    text,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    console.log("Email sent");
    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to send email." },
      { status: 500 }
    );
  }
}