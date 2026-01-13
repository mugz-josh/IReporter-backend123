# Deploying iReporter Backend to Render

## Prerequisites
- A Render account (https://render.com)
- A MySQL database on Render or another provider
- Your backend code pushed to a Git repository (GitHub, GitLab, etc.)

## Steps to Deploy

### 1. Prepare Your Repository
- Ensure your code is pushed to a Git repository
- Make sure you have a `render.yaml` file in the root of your repository

### 2. Create a MySQL Database on Render
1. Go to your Render dashboard
2. Click "New" > "PostgreSQL" (Note: Render calls it PostgreSQL but supports MySQL protocol)
3. Choose your plan and create the database
4. Note down the connection details (host, username, password, database name)

### 3. Set Up Environment Secrets
1. In your Render dashboard, go to your project settings
2. Add the following environment variables as secrets:
   - `DB_HOST`: Your database host
   - `DB_USER`: Your database username
   - `DB_PASSWORD`: Your database password
   - `DB_NAME`: Your database name
   - `JWT_SECRET`: A secure random string for JWT signing
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., https://your-frontend.onrender.com)
   - `EMAIL_USER`: Your email service username
   - `EMAIL_PASS`: Your email service password

### 4. Deploy the Backend
1. In Render dashboard, click "New" > "Web Service"
2. Connect your Git repository
3. Choose the branch to deploy from
4. Select "Node" as the runtime
5. Set build command: `npm run build`
6. Set start command: `npm start`
7. Configure environment variables (or use the render.yaml file)
8. Click "Create Web Service"

### 5. Run Database Migrations
After deployment, you may need to run your database setup scripts:
1. Access your Render service logs
2. Run the setup scripts if needed (check your `setupDatabase.js` and `setupTables.js`)

## Environment Variables Required
- `NODE_ENV`: Set to "production"
- `PORT`: Render will set this automatically, but defaults to 10000
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: URL of your frontend application
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password

## Health Check
Your API has a health endpoint at `/health` that you can use to verify the deployment.

## Troubleshooting
- Check Render logs for any errors
- Ensure all environment variables are set correctly
- Verify database connectivity
- Make sure your build process completes successfully
