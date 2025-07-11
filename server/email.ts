import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured. Cannot send email.');
      return false;
    }

    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendSurveyNotification(
  userEmail: string,
  userName: string,
  surveyTitle: string,
  surveyDescription: string,
  emailSubject: string,
  emailBody: string,
  surveyUrl?: string
): Promise<boolean> {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@glory.media';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">2025 GLORY Sports Summit</h1>
      </div>
      
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${userName},</h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          ${emailBody}
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">${surveyTitle}</h3>
          <p style="color: #6b7280; margin-bottom: 15px;">${surveyDescription}</p>
          
          ${surveyUrl ? `
            <a href="${surveyUrl}" 
               style="background-color: #f97316; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Take Survey
            </a>
          ` : ''}
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for attending the GLORY Sports Summit!<br>
          The GLORY Team
        </p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 GLORY Sports Summit. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = `
Hi ${userName},

${emailBody}

Survey: ${surveyTitle}
${surveyDescription}

${surveyUrl ? `Take the survey here: ${surveyUrl}` : ''}

Thank you for attending the GLORY Sports Summit!
The GLORY Team

© 2025 GLORY Sports Summit. All rights reserved.
  `;

  return sendEmail({
    to: userEmail,
    from: fromEmail,
    subject: emailSubject,
    text: textContent,
    html: htmlContent,
  });
}