# 🔧 Debug Guide for AI Peer Review System

## 🚨 **Submission Issues - Step by Step Debugging**

### **1. Check Server Status**
```bash
# Test if server is running
curl http://localhost:5000/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

### **2. Check Server Logs**
Look for these log messages in the server console:
- `🔐 Auth middleware - Token present: true/false`
- `📝 Creating submission with data: {...}`
- `✅ Submission created successfully: [ID]`

### **3. Test Authentication**
```bash
# Test auth endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **4. Test Submission Endpoint**
```bash
# Test submission endpoint (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test","content":"Test content","type":"text"}'
```

### **5. Frontend Debug Steps**

#### **A. Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when submitting
4. Check Network tab for failed requests

#### **B. Test with Debug Page**
1. Navigate to `/test-submission` in the app
2. Use the test buttons to debug step by step
3. Check the response data

#### **C. Check Authentication**
1. Verify you're logged in
2. Check if token is stored in localStorage
3. Look for auth errors in console

### **6. Common Issues & Solutions**

#### **Issue: "Failed to create submission"**
**Possible Causes:**
- Authentication token missing or invalid
- Server not running
- Database connection issues
- Missing required fields

**Solutions:**
1. Check if user is logged in
2. Verify server is running on port 5000
3. Check MongoDB connection
4. Ensure all required fields are filled

#### **Issue: "No token, authorization denied"**
**Solutions:**
1. Log out and log back in
2. Clear browser localStorage
3. Check if token is being sent in headers

#### **Issue: "MongoDB connection error"**
**Solutions:**
1. Start MongoDB: `mongod`
2. Check MongoDB is running: `mongo`
3. Verify connection string in .env

#### **Issue: CORS errors**
**Solutions:**
1. Check CORS configuration in server/index.js
2. Ensure CLIENT_URL is correct
3. Try accessing from localhost:3000

### **7. Server Configuration Check**

#### **A. Environment Variables**
Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-peer-review
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

#### **B. Dependencies**
```bash
# Install all dependencies
npm run install-all

# Or manually:
cd server && npm install
cd ../client && npm install
```

#### **C. Database Setup**
```bash
# Start MongoDB
mongod

# In another terminal, test connection
mongo
```

### **8. Step-by-Step Testing**

#### **Step 1: Test Server Health**
```bash
curl http://localhost:5000/api/health
```

#### **Step 2: Test Server Routes**
```bash
curl http://localhost:5000/api/test
```

#### **Step 3: Test Submissions Route**
```bash
curl http://localhost:5000/api/submissions/test
```

#### **Step 4: Test Authentication**
1. Register a new user
2. Login and get token
3. Test protected endpoint

#### **Step 5: Test Submission Creation**
1. Use the test page at `/test-submission`
2. Check browser console for errors
3. Check server logs for detailed info

### **9. Debug Commands**

#### **Check Server Status**
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Check if MongoDB is running
netstat -an | grep 27017
```

#### **Check Logs**
```bash
# Server logs will show in the terminal where you ran `npm run dev`
# Look for:
# - 🔐 Auth middleware messages
# - 📝 Submission creation messages
# - ❌ Error messages
```

### **10. Quick Fixes**

#### **Reset Everything**
```bash
# Stop all processes
# Clear node_modules
rm -rf node_modules server/node_modules client/node_modules

# Reinstall
npm run install-all

# Restart MongoDB
mongod

# Start servers
npm run dev
```

#### **Clear Browser Data**
1. Open Developer Tools
2. Go to Application tab
3. Clear localStorage
4. Refresh page

### **11. Expected Behavior**

#### **Successful Submission Flow:**
1. User fills form and clicks "Submit for Review"
2. Frontend sends POST to `/api/submissions`
3. Server logs: `📝 Creating submission with data: {...}`
4. Server logs: `✅ Submission created successfully: [ID]`
5. Frontend receives success response
6. User is redirected to submission detail page

#### **Error Flow:**
1. User fills form and clicks "Submit for Review"
2. Frontend sends POST to `/api/submissions`
3. Server logs error details
4. Frontend receives error response
5. User sees error toast message

### **12. Contact & Support**

If issues persist:
1. Check the server console logs
2. Check browser console logs
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Check network connectivity

**Remember:** The debug page at `/test-submission` is your best friend for troubleshooting!

