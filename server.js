import express from "express";
import "dotenv/config";
import nodemailer from "nodemailer";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT environment variable is not set

// Middleware to enable CORS
app.use(cors({ origin: process.env.CORS_ORIGIN }));
// Middleware to parse JSON body
app.use(express.json());
// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 3, // Maximum number of requests allowed
  message: "Rate limit exceeded. Please try again later.",
});
// Apply rate limiter to specific route
app.use("/api/contact/submit", limiter);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Controller method to handle form submission
const submitContactForm = async (req, res) => {
  const { name, lastName, email, subject } = req.body;
  try {
    // Send email with the form data
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME, // Sender address
      to: process.env.EMAIL_RECEIVER, // Receiver address
      subject: "New Contact Form Submission",
      text: `
            First Name: ${name}
            Last Name: ${lastName}
            Email: ${email}
            Subject: ${subject}
          `,
    });

    res.status(201).json({
      message: "Email sent successfully.",
    });
  } catch (emailError) {
    res
      .status(500)
      .json({ error: "An error occurred while sending the email." });
  }
};

// Route to handle form submission
app.post("/api/contact/submit", submitContactForm);

app.listen(PORT, () => {});
