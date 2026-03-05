# PowerShell script to update Vercel environment variables for backend

# MongoDB Connection String (NOTE: Password contains @ which needs to be encoded as %40)
$mongoURI = "mongodb+srv://Ujjawal:ujjawal_ghosh1%40@cluster0.d2pmppm.mongodb.net/?appName=Cluster0"

# JWT Secret
$jwtSecret = "wellnesshub_jwt_secret_key_2024"

Write-Host "Setting up Vercel environment variables for backend..."

# Navigate to backend directory
Set-Location backend

# Remove existing MONGODB_URI if it exists
Write-Host "Setting MONGODB_URI..."
echo $mongoURI | vercel env add MONGODB_URI production

# Add JWT_SECRET
Write-Host "Setting JWT_SECRET..."
echo $jwtSecret | vercel env add JWT_SECRET production

# Go back to root
Set-Location ..

Write-Host "Environment variables set successfully!"
Write-Host "Now redeploy with: vercel --prod"
