declare class EmailService {
    static sendReportStatusNotification(userEmail: string | string[], reportType: string, reportTitle: string, oldStatus: string, newStatus: string): Promise<void>;
    private static createUserEmailTemplate;
    private static createAdminEmailTemplate;
}
export default EmailService;
//# sourceMappingURL=emailService.d.ts.map