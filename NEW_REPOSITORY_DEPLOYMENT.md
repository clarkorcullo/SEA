# 🚀 New Repository Deployment Guide - SEA (Social Engineering Awareness)

## 📋 **Repository Migration Complete**

✅ **Source Repository**: `https://github.com/clarkorcullo/SEA_ProtoType.git`  
✅ **New Repository**: `https://github.com/clarkorcullo/SEA.git`  
✅ **Migration Status**: Successfully completed  
✅ **Render Deployment**: Same configuration maintained  

---

## 🎯 **Quick Deployment Steps**

### **1. Render Service Configuration**

#### **Basic Settings**
- **Repository**: `https://github.com/clarkorcullo/SEA.git`
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Environment**: `Python 3`
- **Region**: Choose closest to your users

#### **Build & Deploy Commands**
```bash
# Build Command
pip install -r requirements.txt

# Start Command
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --keep-alive 5 --max-requests 1000 --max-requests-jitter 100
```

### **2. Environment Variables (CRITICAL)**

Set these in Render Dashboard → Your Service → Environment:

#### **Required Variables**
```
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
RENDER=true
DATABASE_URL=postgresql://username:password@host:port/database
```

#### **Admin Configuration**
```
ADMIN_EMAIL=admin@mmdc.edu.ph
ADMIN_PASSWORD=your-secure-admin-password
```

#### **Optional Variables**
```
LOG_LEVEL=INFO
```

### **3. Database Setup (CRITICAL FOR DATA PERSISTENCE)**

#### **Create PostgreSQL Database**
1. **Render Dashboard** → "New +" → "PostgreSQL"
2. **Name**: `social-engineering-db`
3. **Plan**: Free (testing) or Starter (production)
4. **Region**: Same as web service
5. **Copy Database URL** and set as `DATABASE_URL` environment variable

#### **Why PostgreSQL is Critical**
- **Without PostgreSQL**: Data resets on every deployment
- **With PostgreSQL**: User accounts, progress, and admin credentials persist
- **Admin Access**: Ensures admin user always exists after deployments

---

## 🔧 **Technical Specifications**

### **Application Architecture**
- **Framework**: Flask 3.0.0
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Flask-Login with secure sessions
- **File Storage**: Static files with profile picture uploads
- **Security**: CSRF protection, secure headers, password validation

### **Key Features**
- ✅ **User Management**: Registration, login, profile management
- ✅ **Learning Modules**: 5 comprehensive social engineering modules
- ✅ **Assessment System**: Knowledge checks and final assessments
- ✅ **Simulation System**: Interactive phishing, pretexting, baiting scenarios
- ✅ **Progress Tracking**: Complete user progress monitoring
- ✅ **Admin Panel**: Comprehensive admin dashboard
- ✅ **Analytics**: User progress and performance analytics

### **Performance Configuration**
```bash
# Gunicorn Settings (Optimized for Render)
--workers 2              # 2 worker processes (optimal for 512MB RAM)
--timeout 120            # 2-minute timeout for long operations
--keep-alive 5           # Keep connections alive for 5 seconds
--max-requests 1000      # Restart workers after 1000 requests
--max-requests-jitter 100 # Add randomness to prevent thundering herd
```

---

## 📊 **Deployment Verification Checklist**

### **Pre-Deployment**
- [ ] **Repository Connected**: GitHub repository linked to Render
- [ ] **Environment Variables**: All required variables set
- [ ] **Database Created**: PostgreSQL database service created
- [ ] **Build Command**: `pip install -r requirements.txt`
- [ ] **Start Command**: Gunicorn command configured

### **Post-Deployment Testing**
- [ ] **Health Check**: `https://your-app.onrender.com/health`
- [ ] **Home Page**: Application loads without errors
- [ ] **User Registration**: New users can register
- [ ] **User Login**: Users can login successfully
- [ ] **Admin Login**: Admin can access admin panel
- [ ] **Module Access**: All 5 modules accessible and functional
- [ ] **Assessment System**: Knowledge checks working
- [ ] **Simulation System**: Interactive simulations working
- [ ] **Progress Tracking**: User progress being tracked
- [ ] **Database Persistence**: Data persists after restart

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **1. Build Failures**
```bash
# Check dependencies
pip freeze > requirements.txt

# Verify Python version
python --version  # Should be 3.11.9
```

#### **2. Database Connection Issues**
- **Check DATABASE_URL**: Ensure PostgreSQL URL is correct
- **Check Database Status**: Verify database service is running
- **Check Environment Variables**: Ensure all required variables set

#### **3. Runtime Errors**
- **Check Logs**: Review Render logs for error details
- **Check Environment**: Verify all environment variables set
- **Check Dependencies**: Ensure all packages installed correctly

#### **4. Performance Issues**
- **Check Memory Usage**: Monitor memory consumption
- **Check Response Times**: Optimize slow endpoints
- **Check Database Queries**: Optimize database operations

---

## 📈 **Monitoring & Maintenance**

### **Health Monitoring**
- **Health Check**: `/health` endpoint responding
- **Uptime Monitoring**: Set up uptime monitoring service
- **Error Tracking**: Monitor error rates and types
- **Performance Monitoring**: Track response times and resource usage

### **Regular Maintenance**
- **Log Review**: Regularly review application logs
- **Database Backup**: Set up regular database backups
- **Security Updates**: Keep dependencies updated
- **Performance Optimization**: Monitor and optimize performance

---

## 🔐 **Security Configuration**

### **Production Security Features**
- ✅ **HTTPS Only**: Enforced in production
- ✅ **Security Headers**: XSS protection, content type options
- ✅ **Session Security**: Secure cookies, HTTP-only, SameSite
- ✅ **CSRF Protection**: Enabled for forms
- ✅ **Password Validation**: Strong password requirements
- ✅ **SQL Injection Protection**: SQLAlchemy ORM protection

### **Admin Security**
- ✅ **Secure Admin Access**: Protected admin routes
- ✅ **Admin User Creation**: Automatic admin user creation
- ✅ **Admin Password**: Configurable via environment variables

---

## 📞 **Support & Resources**

### **Documentation**
- **README.md**: Comprehensive project documentation
- **RENDER_DEPLOYMENT.md**: Detailed Render deployment guide
- **PROJECT_MEMORY.md**: Complete project history and decisions
- **DEPLOYMENT_CHECKLIST.md**: Step-by-step deployment checklist

### **Technical Support**
- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Flask Documentation**: [flask.palletsprojects.com](https://flask.palletsprojects.com)
- **GitHub Repository**: [github.com/clarkorcullo/SEA](https://github.com/clarkorcullo/SEA)

### **Application Endpoints**
- **Health Check**: `/health`
- **Admin Panel**: `/admin` (use admin credentials)
- **User Dashboard**: `/dashboard` (after login)
- **Module Access**: `/module/<id>` (after login)

---

## 🎉 **Deployment Success Criteria**

### **Technical Success**
- [ ] **Application Live**: Application accessible via public URL
- [ ] **All Features Working**: All functionality operational
- [ ] **Database Persistent**: Data persists across restarts
- [ ] **Performance Acceptable**: Response times under 3 seconds
- [ ] **No Critical Errors**: Application runs without critical errors

### **User Experience Success**
- [ ] **User Registration**: Users can create accounts
- [ ] **Module Access**: Users can access all 5 modules
- [ ] **Progress Tracking**: User progress tracked accurately
- [ ] **Assessment System**: Knowledge checks functional
- [ ] **Simulation System**: Interactive simulations working
- [ ] **Admin Panel**: Admin can manage system

---

**🎯 Your Social Engineering Awareness Program is now ready for production deployment on the new repository!**

*This guide ensures a smooth transition to the new GitHub repository while maintaining all existing functionality and Render deployment configuration.*
