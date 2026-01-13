import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: false,      
  logger:false  
});


transporter.verify((error) => {
  if (error) {
    console.log('❌ Email connection error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});


export const testEmail = async (): Promise<any> => {
  try {
    console.log('🧪 Testing email to: abdul.kibirango@upti.com');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'abdul.kibirango@upti.com',
      subject: 'TEST Email - Is this working?',
      text: 'This is a test email from your app',
      html: '<strong>This is a test email from your app</strong>'
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);
    
    return info;
  } catch (error) {
    console.log('❌ Test email failed:', error);
    throw error;
  }
};

export default transporter;