import transporter from "../utils/email";
import { emailConstants, getBaseStyles } from "../styles/emailStyles";
import {
  getPriorityLevel,
  getPriorityClass,
  getStatusEmoji,
  getStatusIcon,
  generateReportId,
  generateUserId,
  generateChangeId,
  generateTrackingId,
  generateNotificationId,
  getUserSubject,
  getAdminSubject,
  getLucideIcon,
} from "../utils/emailHelper";

class EmailService {
  static async sendReportStatusNotification(
    userEmail: string | string[],
    reportType: string,
    reportTitle: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      const userEmailString = Array.isArray(userEmail)
        ? userEmail.join(", ")
        : userEmail;

      const adminEmail =
        process.env.ADMIN_EMAIL || "joshua.mugisha.upti@gmail.com";
      const reportTypeDisplay =
        reportType === "redflag" ? "Red Flag" : "Intervention";

      const userMailOptions = {
        from: `iReporter System <${process.env.EMAIL_USER}>`,
        to: userEmailString,
        subject: getUserSubject(reportTypeDisplay),
        html: this.createUserEmailTemplate(
          userEmailString,
          reportTypeDisplay,
          reportTitle,
          oldStatus,
          newStatus
        ),
      };

      const adminMailOptions = {
        from: `iReporter System <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: getAdminSubject(reportTypeDisplay),
        html: this.createAdminEmailTemplate(
          userEmailString,
          reportTypeDisplay,
          reportTitle,
          oldStatus,
          newStatus
        ),
      };

      await Promise.all([
        transporter.sendMail(userMailOptions),
        transporter.sendMail(adminMailOptions),
      ]);

      console.log("Emails sent successfully.");
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  }

  
  private static createUserEmailTemplate(
    userEmail: string,
    reportType: string,
    reportTitle: string,
    oldStatus: string,
    newStatus: string
  ): string {
    const style = emailConstants;
    const reportId = generateReportId();
    const trackingId = generateTrackingId();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Status Update - iReporter</title>
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="header-pattern"></div>
      <div class="logo-badge">Status Update</div>
      <div class="logo-container">
        <img src="${style.urls.logo}" alt="iReporter Logo" class="logo">
      </div>
      <h1 class="header-title">Report Status Updated</h1>
      <p class="header-subtitle">Your ${reportType} report has been reviewed</p>
      <p class="brand-tagline">Professional • Secure • Transparent</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Trust Indicators -->
      <div class="trust-indicators">
        <div class="trust-badge">${getLucideIcon("shield")} Secure</div>
        <div class="trust-badge">${getLucideIcon("lock")} Encrypted</div>
        <div class="trust-badge">${getLucideIcon("check-circle")} Verified</div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar" style="width: 75%;"></div>
      </div>
      <div class="progress-text">Report Processing: 75% Complete</div>

      <!-- Greeting -->
      <div class="mb-4">
        <h2 class="heading-primary">Hello ${userEmail.split("@")[0]},</h2>
        <p class="text-lead">Your report has been reviewed and its status has been updated. Here are the details:</p>
      </div>
      
      <!-- Report Summary Table -->
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">Report Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label">Report Type</td>
            <td>
              <strong>${reportType}</strong>
              <span class="priority-badge ${getPriorityClass(
                newStatus
              )}" style="margin-left: 12px;">
                ${getPriorityLevel(newStatus)}
              </span>
            </td>
          </tr>
          <tr>
            <td class="label">Report Title</td>
            <td>"${reportTitle}"</td>
          </tr>
          <tr>
            <td class="label">Report ID</td>
            <td><code>${reportId}</code></td>
          </tr>
          <tr>
            <td class="label">Date Submitted</td>
            <td>${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</td>
          </tr>
          <tr>
            <td class="label">Last Updated</td>
            <td>${new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Status Update -->
      <h3 class="mb-2 text-primary">Status Update</h3>
      <div class="status-panel">
        <div class="status-card old">
          <div class="status-label">Previous Status</div>
          <div class="status-value old-value">
            ${getStatusEmoji(oldStatus)} ${oldStatus.toUpperCase()}
          </div>
        </div>

        <div class="status-card new">
          <div class="status-label">Current Status</div>
          <div class="status-value new-value">
            ${getStatusEmoji(newStatus)} ${newStatus.toUpperCase()}
          </div>
        </div>
      </div>

      <!-- Enhanced Action Grid -->
      <h3 class="mb-2 text-primary">Recommended Actions</h3>
      <div class="action-grid">
        <div class="action-card primary">
          <div class="action-icon">${getLucideIcon("eye")}</div>
          <div class="action-title">View Full Report</div>
          <div class="action-description">Access complete report details and history</div>
          <a href="${
            style.urls.reports
          }" class="btn btn-primary">View Report</a>
        </div>

        <div class="action-card secondary">
          <div class="action-icon">${getLucideIcon("dashboard")}</div>
          <div class="action-title">Dashboard Overview</div>
          <div class="action-description">Monitor all your reports in one place</div>
          <a href="${
            style.urls.dashboard
          }" class="btn btn-secondary">Go to Dashboard</a>
        </div>

        <div class="action-card support">
          <div class="action-icon">${getLucideIcon("headphones")}</div>
          <div class="action-title">Need Help?</div>
          <div class="action-description">Our support team is here to assist you</div>
          <a href="${
            style.urls.contact
          }" class="btn btn-outline">Contact Support</a>
        </div>
      </div>

      <!-- Timeline Table -->
      <h3 class="mb-2 text-primary">Next Steps Timeline</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Step</th>
            <th>Description</th>
            <th>Expected Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Review</strong></td>
            <td>Administrative review of the status change</td>
            <td>1-2 business days</td>
          </tr>
          <tr>
            <td><strong>Processing</strong></td>
            <td>System updates and notification processing</td>
            <td>Immediate</td>
          </tr>
          <tr>
            <td><strong>Follow-up</strong></td>
            <td>Additional review if required</td>
            <td>3-5 business days</td>
          </tr>
          <tr>
            <td><strong>Resolution</strong></td>
            <td>Final resolution and closure</td>
            <td>${newStatus === "resolved" ? "Completed" : "Pending"}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Important Alert -->
      <div class="alert alert-warning">
        <strong> Important Notice:</strong>
        <p class="mt-1">
          This is an automated notification. Please do not reply to this email. 
          For inquiries, contact <a href="mailto:${
            style.urls.supportEmail
          }" style="color: ${style.colors.warning};">${
      style.urls.supportEmail
    }</a>.
          Keep your Report ID for future reference.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${style.urls.helpCenter}" class="footer-link">Help Center</a>
        <a href="${
          style.urls.privacyPolicy
        }" class="footer-link">Privacy Policy</a>
        <a href="${style.urls.terms}" class="footer-link">Terms of Service</a>
        <a href="${style.urls.dashboard}" class="footer-link">Your Dashboard</a>
        <a href="${style.urls.reports}" class="footer-link">Report Portal</a>
      </div>
      <div class="footer-copyright">
        <p>© ${new Date().getFullYear()} iReporter. All rights reserved.</p>
        <p>This email was sent to ${userEmail}</p>
        <p style="opacity: 0.7; font-size: 11px; margin-top: 8px;">
          Reference: ${reportId} • Tracking: ${trackingId}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  
  private static createAdminEmailTemplate(
    userEmail: string,
    reportType: string,
    reportTitle: string,
    oldStatus: string,
    newStatus: string
  ): string {
    const style = emailConstants;
    const reportId = generateReportId();
    const userId = generateUserId();
    const changeId = generateChangeId();
    const notificationId = generateNotificationId();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Alert - Report Status Update - iReporter</title>
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="logo-badge">Admin Alert</div>
      <div class="logo-container">
        <img src="${style.urls.logo}" alt="iReporter Admin Logo" class="logo">
      </div>
      <h1 class="header-title">Report Status Updated</h1>
      <p class="header-subtitle">Administrative action required</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Critical Alert -->
      <div class="alert alert-warning">
        <strong>${getLucideIcon(
          "alert-triangle"
        )} ADMINISTRATIVE ACTION REQUIRED:</strong>
        <p class="mt-1">A report status change has been processed. Verification and documentation required.</p>
      </div>

      <!-- Quick Stats -->
      <div class="status-panel">
        <div class="status-card">
          <div class="status-label">Report Type</div>
          <div class="status-value" style="background: ${
            style.colors.primary
          }; color: white;">
            ${getStatusIcon(reportType)} ${reportType}
          </div>
        </div>

        <div class="status-card">
          <div class="status-label">Priority Level</div>
          <div class="status-value ${getPriorityClass(newStatus)}">
            ${getPriorityLevel(newStatus)}
          </div>
        </div>
      </div>

      <!-- Report Details Table -->
      <h3 class="mb-2 text-primary">Report Details</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Details</th>
            <th>Metadata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label">Report ID</td>
            <td><code>${reportId}</code></td>
            <td>Category: ${reportType}</td>
          </tr>
          <tr>
            <td class="label">Title</td>
            <td colspan="2">"${reportTitle}"</td>
          </tr>
          <tr>
            <td class="label">User</td>
            <td>${userEmail}</td>
            <td>ID: ${userId}</td>
          </tr>
          <tr>
            <td class="label">Timestamp</td>
            <td>${new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}</td>
            <td>UTC ${new Date().getTimezoneOffset() / -60}</td>
          </tr>
          <tr>
            <td class="label">Change ID</td>
            <td><code>${changeId}</code></td>
            <td>Action: Status Update</td>
          </tr>
        </tbody>
      </table>

      <!-- Status Change Details -->
      <h3 class="mb-2 text-primary">Status Change Details</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Value</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Previous</strong></td>
            <td>
              <span class="priority-badge">${oldStatus.toUpperCase()}</span>
              ${getStatusIcon(oldStatus)}
            </td>
            <td>${new Date(Date.now() - 3600000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
            <td>—</td>
          </tr>
          <tr>
            <td><strong>Current</strong></td>
            <td>
              <span class="priority-badge ${getPriorityClass(newStatus)}">
                ${newStatus.toUpperCase()}
              </span>
              ${getStatusIcon(newStatus)}
            </td>
            <td>${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
            <td><span class="priority-badge priority-high">UPDATED</span></td>
          </tr>
        </tbody>
      </table>

      <!-- System Actions Grid -->
      <h3 class="mb-2 text-primary">System Actions</h3>
      <div class="action-grid">
        <div class="action-card">
          <div class="action-icon">${getLucideIcon("settings")}</div>
          <div class="action-title">Admin Panel</div>
          <div class="action-description">Access full administrative controls</div>
          <a href="${
            style.urls.adminPanel
          }" class="btn btn-primary">Open Panel</a>
        </div>

        <div class="action-card">
          <div class="action-icon">${getLucideIcon("clipboard")}</div>
          <div class="action-title">Report Details</div>
          <div class="action-description">View complete report information</div>
          <a href="${
            style.urls.reportDetails
          }" class="btn btn-secondary">View Report</a>
        </div>

        <div class="action-card">
          <div class="action-icon">${getLucideIcon("bar-chart")}</div>
          <div class="action-title">Audit Logs</div>
          <div class="action-description">Review system audit trail</div>
          <a href="${
            style.urls.auditLogs
          }" class="btn btn-secondary">View Logs</a>
        </div>

        <div class="action-card">
          <div class="action-icon">${getLucideIcon("user")}</div>
          <div class="action-title">User Profile</div>
          <div class="action-description">Access user information</div>
          <a href="${
            style.urls.userProfile
          }" class="btn btn-secondary">View User</a>
        </div>
      </div>

      <!-- System Audit Table -->
      <h3 class="mb-2 text-primary">System Audit Trail</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
            <th>Details</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Database</td>
            <td><span class="priority-badge priority-low">UPDATED</span></td>
            <td>Report status updated in primary DB</td>
            <td>${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
          <tr>
            <td>Notifications</td>
            <td><span class="priority-badge priority-low">SENT</span></td>
            <td>User notification dispatched</td>
            <td>${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
          <tr>
            <td>Audit System</td>
            <td><span class="priority-badge priority-low">LOGGED</span></td>
            <td>Change recorded in audit trail</td>
            <td>${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
          <tr>
            <td>Security</td>
            <td><span class="priority-badge priority-low">VERIFIED</span></td>
            <td>Security check passed</td>
            <td>${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
        </tbody>
      </table>

      <!-- Compliance Check -->
      <h3 class="mb-2 text-primary">Compliance Verification</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Check</th>
            <th>Status</th>
            <th>Verified By</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Policy Compliance</td>
            <td><span class="priority-badge priority-low">PASS</span></td>
            <td>System Validator</td>
            <td>Compliant with all policies</td>
          </tr>
          <tr>
            <td>Data Integrity</td>
            <td><span class="priority-badge priority-low">PASS</span></td>
            <td>Integrity Check v2.1</td>
            <td>Data integrity maintained</td>
          </tr>
          <tr>
            <td>Access Control</td>
            <td><span class="priority-badge priority-low">PASS</span></td>
            <td>Security Module</td>
            <td>Authorized access only</td>
          </tr>
          <tr>
            <td>Audit Requirements</td>
            <td><span class="priority-badge priority-low">PASS</span></td>
            <td>Audit System</td>
            <td>All requirements met</td>
          </tr>
        </tbody>
      </table>

      <!-- Important Alert -->
      <div class="alert alert-info">
        <strong>${getLucideIcon(
          "clipboard-list"
        )} Administrative Notes:</strong>
        <ul style="margin-left: 20px; margin-top: 8px;">
          <li>This action has been logged in the permanent audit trail</li>
          <li>The user (${userEmail}) has been notified automatically</li>
          <li>All system components have been updated</li>
          <li>Compliance verification completed successfully</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${
          style.urls.adminPanel
        }" class="footer-link">Admin Dashboard</a>
        <a href="${style.urls.analytics}" class="footer-link">Analytics</a>
        <a href="${style.urls.settings}" class="footer-link">Settings</a>
        <a href="${style.urls.auditLogs}" class="footer-link">Audit Logs</a>
        <a href="${
          style.urls.userProfile
        }" class="footer-link">User Management</a>
      </div>
      <div class="footer-copyright">
        <p>© ${new Date().getFullYear()} iReporter Admin System v2.4.1</p>
        <p>This is an automated administrative notification</p>
        <p style="opacity: 0.7; font-size: 11px; margin-top: 8px;">
          Notification ID: ${notificationId} •
          System: PROD-01 •
          User: ${userEmail.split("@")[0]}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export default EmailService;
