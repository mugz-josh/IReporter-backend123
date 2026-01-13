import { emailConstants } from "./emailConstants";

const style = emailConstants;

export const getBaseStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${style.fonts.primary};
    background-color: ${style.colors.background};
    color: ${style.colors.dark};
    line-height: 1.6;
    padding: ${style.spacing.lg};
  }
  
  .email-wrapper {
    max-width: 680px;
    margin: 0 auto;
    background: ${style.colors.white};
    border-radius: 16px;
    overflow: hidden;
    box-shadow: ${style.shadows.lg};
  }
  

  .header {
    background: linear-gradient(135deg, ${style.colors.primary} 0%, #1a2530 100%);
    padding: ${style.spacing.xxl} ${style.spacing.xl};
    text-align: center;
    color: ${style.colors.white};
    position: relative;
  }
  
  .logo-badge {
    position: absolute;
    top: ${style.spacing.lg};
    left: ${style.spacing.lg};
    background: ${style.colors.accent};
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .logo-container {
    width: 96px;
    height: 96px;
    margin: 0 auto ${style.spacing.lg};
    background: ${style.colors.white};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border: 4px solid rgba(255,255,255,0.2);
  }
  
  .logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    border-radius: 50%;
  }
  
  .header-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: ${style.spacing.sm};
    letter-spacing: -0.5px;
  }
  
  .header-subtitle {
    font-size: 14px;
    opacity: 0.9;
    font-weight: 400;
  }
  
  
  .content {
    padding: ${style.spacing.xxl};
  }
  
  
  .data-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: ${style.spacing.xl} 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: ${style.shadows.md};
  }
  
  .data-table thead {
    background: linear-gradient(135deg, ${style.colors.secondary} 0%, #2980b9 100%);
  }
  
  .data-table th {
    padding: ${style.spacing.lg} ${style.spacing.xl};
    text-align: left;
    color: ${style.colors.white};
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .data-table tbody tr {
    border-bottom: 1px solid ${style.colors.lightGray};
    transition: background-color 0.2s ease;
  }
  
  .data-table tbody tr:nth-child(even) {
    background-color: ${style.colors.light};
  }
  
  .data-table tbody tr:hover {
    background-color: rgba(52, 152, 219, 0.05);
  }
  
  .data-table td {
    padding: ${style.spacing.lg} ${style.spacing.xl};
    font-size: 15px;
    vertical-align: middle;
  }
  
  .data-table .label {
    font-weight: 600;
    color: ${style.colors.primary};
    min-width: 140px;
  }
  

  .status-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${style.spacing.lg};
    margin: ${style.spacing.xl} 0;
  }
  
  .status-card {
    padding: ${style.spacing.xl};
    border-radius: 12px;
    text-align: center;
    background: ${style.colors.white};
    border: 2px solid ${style.colors.lightGray};
    transition: all 0.3s ease;
  }
  
  .status-card:hover {
    transform: translateY(-4px);
    box-shadow: ${style.shadows.lg};
  }
  
  .status-card.old {
    border-color: ${style.colors.gray};
  }
  
  .status-card.new {
    border-color: ${style.colors.secondary};
    background: linear-gradient(135deg, #f8fafc 0%, #f1f8ff 100%);
  }
  
  .status-label {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${style.colors.gray};
    margin-bottom: ${style.spacing.md};
    font-weight: 600;
  }
  
  .status-value {
    font-size: 22px;
    font-weight: 700;
    padding: ${style.spacing.sm} ${style.spacing.lg};
    border-radius: 8px;
    display: inline-block;
  }
  
  .old-value {
    background: ${style.colors.lightGray};
    color: ${style.colors.dark};
  }
  
  .new-value {
    background: linear-gradient(135deg, ${style.colors.secondary} 0%, #2980b9 100%);
    color: ${style.colors.white};
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  
  .priority-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .priority-high {
    background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
    color: white;
  }
  
  .priority-medium {
    background: linear-gradient(135deg, #feca57 0%, #f39c12 100%);
    color: #2d3436;
  }
  
  .priority-low {
    background: linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%);
    color: white;
  }
  
  
  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${style.spacing.lg};
    margin: ${style.spacing.xl} 0;
  }
  
  .action-card {
    padding: ${style.spacing.xl};
    border-radius: 12px;
    background: ${style.colors.white};
    border: 2px solid ${style.colors.lightGray};
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .action-card:hover {
    transform: translateY(-4px);
    border-color: ${style.colors.secondary};
    box-shadow: ${style.shadows.lg};
  }
  
  .action-icon {
    font-size: 32px;
    margin-bottom: ${style.spacing.md};
  }
  
  .action-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: ${style.spacing.sm};
    color: ${style.colors.primary};
  }
  
  .action-description {
    font-size: 13px;
    color: ${style.colors.gray};
    margin-bottom: ${style.spacing.md};
  }
  
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: ${style.spacing.md} ${style.spacing.xl};
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    gap: ${style.spacing.sm};
    min-width: 160px;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, ${style.colors.secondary} 0%, #2980b9 100%);
    color: ${style.colors.white};
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  }
  
  .btn-secondary {
    background: ${style.colors.light};
    color: ${style.colors.primary};
    border: 2px solid ${style.colors.lightGray};
  }
  
  .btn-secondary:hover {
    border-color: ${style.colors.secondary};
    background: ${style.colors.white};
  }
  
  
  .footer {
    background: linear-gradient(135deg, #2c3e50 0%, #1a2530 100%);
    padding: ${style.spacing.xxl} ${style.spacing.xl};
    color: ${style.colors.white};
    text-align: center;
  }
  
  .footer-links {
    display: flex;
    justify-content: center;
    gap: ${style.spacing.xl};
    margin: ${style.spacing.xl} 0;
    flex-wrap: wrap;
  }
  
  .footer-link {
    color: rgba(255,255,255,0.8);
    text-decoration: none;
    font-size: 13px;
    transition: color 0.3s ease;
  }
  
  .footer-link:hover {
    color: ${style.colors.accent};
  }
  
  .footer-copyright {
    font-size: 12px;
    color: rgba(255,255,255,0.6);
    margin-top: ${style.spacing.xl};
    line-height: 1.5;
  }

  .alert {
    padding: ${style.spacing.xl};
    border-radius: 12px;
    margin: ${style.spacing.xl} 0;
    border-left: 4px solid;
    background: ${style.colors.light};
  }
  
  .alert-warning {
    border-color: ${style.colors.warning};
    background: linear-gradient(135deg, rgba(243, 156, 18, 0.05) 0%, rgba(243, 156, 18, 0.1) 100%);
  }
  
  .alert-info {
    border-color: ${style.colors.secondary};
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.05) 0%, rgba(52, 152, 219, 0.1) 100%);
  }
  
  
  @media (max-width: ${style.breakpoints.tablet}) {
    .content {
      padding: ${style.spacing.xl};
    }
    
    .status-panel {
      grid-template-columns: 1fr;
    }
    
    .action-grid {
      grid-template-columns: 1fr;
    }
    
    .data-table {
      display: block;
      overflow-x: auto;
    }
  }
  
  @media (max-width: ${style.breakpoints.mobile}) {
    body {
      padding: ${style.spacing.sm};
    }
    
    .header, .content, .footer {
      padding: ${style.spacing.lg};
    }
    
    .header-title {
      font-size: 24px;
    }
    
    .data-table th,
    .data-table td {
      padding: ${style.spacing.md};
    }
    
    .footer-links {
      flex-direction: column;
      gap: ${style.spacing.md};
    }
    
    .btn {
      width: 100%;
    }
  }
  

  .progress-container {
    margin: ${style.spacing.xl} 0;
    background: ${style.colors.lightGray};
    border-radius: 20px;
    padding: 2px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .progress-bar {
    height: 8px;
    background: linear-gradient(135deg, ${style.colors.secondary} 0%, #2980b9 100%);
    border-radius: 20px;
    transition: width 0.8s ease;
    position: relative;
    overflow: hidden;
  }

  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .progress-text {
    text-align: center;
    font-size: 12px;
    color: ${style.colors.gray};
    margin-top: ${style.spacing.sm};
    font-weight: 500;
  }

  
  .trust-indicators {
    display: flex;
    justify-content: center;
    gap: ${style.spacing.md};
    margin: ${style.spacing.xl} 0;
    flex-wrap: wrap;
  }

  .trust-badge {
    display: inline-flex;
    align-items: center;
    gap: ${style.spacing.xs};
    padding: ${style.spacing.sm} ${style.spacing.md};
    background: linear-gradient(135deg, ${style.colors.success} 0%, #27ae60 100%);
    color: white;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  }

  
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${style.colors.lightGray}, transparent);
    margin: ${style.spacing.xxl} 0;
    position: relative;
  }

  .section-divider::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, ${style.colors.secondary} 0%, #2980b9 100%);
    border-radius: 2px;
  }

  
  .timeline {
    position: relative;
    margin: ${style.spacing.xl} 0;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    margin-bottom: ${style.spacing.lg};
    position: relative;
  }

  .timeline-item:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 15px;
    top: 30px;
    width: 2px;
    height: calc(100% - 30px);
    background: linear-gradient(to bottom, ${style.colors.secondary}, ${style.colors.lightGray});
  }

  .timeline-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${style.colors.white};
    border: 3px solid ${style.colors.secondary};
    margin-right: ${style.spacing.md};
    font-size: 14px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  }

  .timeline-content {
    flex: 1;
  }

  .timeline-title {
    font-weight: 600;
    color: ${style.colors.primary};
    margin-bottom: 2px;
  }

  .timeline-desc {
    font-size: 13px;
    color: ${style.colors.gray};
  }

  .timeline-time {
    font-size: 11px;
    color: ${style.colors.gray};
    font-weight: 500;
  }

  /* Enhanced Header */
  .header-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  .brand-tagline {
    font-size: 12px;
    opacity: 0.8;
    font-weight: 300;
    letter-spacing: 1px;
    margin-top: ${style.spacing.sm};
  }


  .btn-group {
    display: flex;
    gap: ${style.spacing.md};
    justify-content: center;
    margin: ${style.spacing.xl} 0;
    flex-wrap: wrap;
  }

  .btn-enhanced {
    position: relative;
    overflow: hidden;
    transform: translateY(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-enhanced::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .btn-enhanced:hover::before {
    left: 100%;
  }

  .btn-enhanced:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  }

  
  .heading-primary {
    font-size: 24px;
    font-weight: 700;
    color: ${style.colors.primary};
    margin-bottom: ${style.spacing.md};
    letter-spacing: -0.5px;
  }

  .heading-secondary {
    font-size: 18px;
    font-weight: 600;
    color: ${style.colors.primary};
    margin-bottom: ${style.spacing.sm};
    letter-spacing: -0.3px;
  }

  .text-lead {
    font-size: 16px;
    line-height: 1.6;
    color: ${style.colors.dark};
    margin-bottom: ${style.spacing.lg};
  }

  .text-muted {
    color: ${style.colors.gray};
    font-size: 14px;
  }

  /* Utility Classes */
  .text-center { text-align: center; }
  .text-primary { color: ${style.colors.primary}; }
  .text-secondary { color: ${style.colors.secondary}; }
  .text-success { color: ${style.colors.success}; }
  .text-danger { color: ${style.colors.danger}; }
  .mb-1 { margin-bottom: ${style.spacing.sm}; }
  .mb-2 { margin-bottom: ${style.spacing.md}; }
  .mb-3 { margin-bottom: ${style.spacing.lg}; }
  .mb-4 { margin-bottom: ${style.spacing.xl}; }
  .mt-1 { margin-top: ${style.spacing.sm}; }
  .mt-2 { margin-top: ${style.spacing.md}; }
  .mt-3 { margin-top: ${style.spacing.lg}; }
  .mt-4 { margin-top: ${style.spacing.xl}; }
`;

// Export constants as well
export { emailConstants };
