# Admin Dashboard Setup Guide

This guide will help you set up and use the admin dashboard for visitor tracking and site management.

## Features

The admin dashboard includes:

- **Visitor Analytics**: Track page views, sessions, unique users, and anonymous visitors
- **Device Analytics**: See traffic breakdown by device type (desktop, mobile, tablet)
- **Browser Analytics**: View traffic by browser and operating system
- **Top Pages**: Identify most visited pages on your site
- **Recent Activity**: Monitor real-time visitor activity
- **Demo Data Management**: Create and manage demo content
- **User Management**: Manage user permissions and admin access

## Setup Instructions

### 1. Make Yourself an Admin

1. First, create a user account on your site if you haven't already
2. Visit `/admin-setup` in your browser
3. Enter your email address and the admin secret
4. Click "Make Admin"

**Default Admin Secret**: `drillshare-admin-2024`

**Important**: For production, set the `ADMIN_SECRET` environment variable to a secure value.

### 2. Access the Admin Dashboard

Once you're an admin, you can access the dashboard at `/admin`

## Admin Dashboard Sections

### Main Dashboard (`/admin`)
- Overview of key metrics for the last 7 days
- Quick access to all admin tools
- Recent activity feed
- System status indicators

### Analytics Dashboard (`/admin/analytics`)
- **Overview Tab**: Key metrics and top pages
- **Top Pages Tab**: Complete list of most visited pages with percentages
- **Devices Tab**: Traffic breakdown by device type
- **Browsers Tab**: Traffic breakdown by browser and OS
- **Recent Activity Tab**: Latest page views and user sessions

### Demo Data Management (`/admin/create-demo-data`)
- Create sample content for testing and demonstrations
- Manage existing demo data

## Analytics Data

The system tracks the following data:

### Page Views
- Page path and title
- User ID and email (if authenticated)
- Device type, browser, and OS
- Timestamp and session ID
- Referrer information

### User Sessions
- Session start and end times
- Number of page views per session
- User information and device details
- Session duration

### Metrics Calculated
- Total page views and sessions
- Unique authenticated users
- Anonymous visitor count
- Top visited pages
- Device and browser breakdowns
- Daily activity trends

## Privacy and Security

### Data Collection
- Only tracks basic analytics data (no personal information beyond email for authenticated users)
- Anonymous visitors are tracked without personal identification
- Admin activity is not tracked to avoid skewing analytics

### Access Control
- Only users with `isAdmin: true` in their user document can access admin features
- Analytics data is protected by Firestore security rules
- Admin secret required for granting admin access

### Data Retention
- Analytics data is stored in Firestore collections: `pageViews` and `userSessions`
- Consider implementing data retention policies for production use

## Environment Variables

Set these environment variables for production:

```bash
# Admin access control
ADMIN_SECRET=your-secure-admin-secret-here

# Firebase configuration (already set)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase config
```

## Firestore Collections

The admin system uses these Firestore collections:

- `users`: User documents with `isAdmin` flag
- `pageViews`: Individual page view records
- `userSessions`: User session records

## Troubleshooting

### Can't Access Admin Dashboard
1. Verify you have `isAdmin: true` in your user document
2. Check that you're signed in
3. Ensure Firestore rules allow admin access

### No Analytics Data
1. Check that the `PageTracker` component is loaded
2. Verify Firestore rules allow writing to analytics collections
3. Check browser console for errors

### Admin Setup Not Working
1. Verify the admin secret is correct
2. Check that the user email exists in the database
3. Ensure the API endpoint is accessible

## Customization

### Adding New Analytics
To track additional metrics:

1. Update the `PageView` or `UserSession` interfaces in `src/lib/analytics.ts`
2. Modify the tracking functions to capture new data
3. Update the admin dashboard to display the new metrics

### Custom Admin Features
To add new admin features:

1. Create new pages in `src/app/admin/`
2. Add navigation items to `src/app/admin/layout.tsx`
3. Implement admin-only API endpoints as needed

## Security Best Practices

1. **Change the default admin secret** immediately after setup
2. **Use environment variables** for sensitive configuration
3. **Regularly review admin access** and remove unnecessary permissions
4. **Monitor admin activity** through Firebase logs
5. **Implement rate limiting** on admin API endpoints for production

## Support

For issues or questions about the admin dashboard:

1. Check the browser console for errors
2. Verify Firestore rules and permissions
3. Ensure all environment variables are set correctly
4. Check Firebase console for any service issues 