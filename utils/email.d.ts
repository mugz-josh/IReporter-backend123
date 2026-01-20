import nodemailer from 'nodemailer';
declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare const testEmail: () => Promise<any>;
export default transporter;
//# sourceMappingURL=email.d.ts.map