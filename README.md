# Email Configuration Setup

To enable email functionality for the contact form, create a `.env.local` file in the root directory with the following variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_TO=sonugupta6045@gmail.com
```

Replace:
- `your-email@gmail.com` with the Gmail account you want to send emails from
- `your-app-password` with an app password generated from your Google account (not your regular password)
- The EMAIL_TO is already set to forward to sonugupta6045@gmail.com

## How to get an App Password for Gmail

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to "App passwords"
5. Select "Mail" and your device
6. Click "Generate"
7. Use the generated 16-character password

After setting up the environment variables, restart the application for the changes to take effect. 