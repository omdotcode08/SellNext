# 🚀 QUICK START - SellNext

## **SIMPLE 3-STEP PROCESS**

### **Step 1: Start Backend (Terminal 1)**
```bash
cd server
npm run simple
```
✅ **Expected:** `Simple server running on http://localhost:4000`

### **Step 2: Start Frontend (Terminal 2)**
```bash
npm run dev
```
✅ **Expected:** `Local: http://localhost:5173/`

### **Step 3: Test Everything**
1. Open http://localhost:5173
2. Click "Test Backend Connection" (blue box)
3. Should show "✅ Backend Connected Successfully!"

## **Test Full Features**
1. **Sign Up** → Creates mock user
2. **Login** → Uses mock authentication  
3. **Add Product** → Creates mock product
4. **View Products** → Shows mock + real products
5. **Cart** → Add items, see count in header
6. **Profile** → Shows "Hi {username}!"

## **What's Working**
- ✅ Context API (username in header/profile, cart count)
- ✅ Mock authentication (no database needed)
- ✅ Mock products (works immediately)
- ✅ Shopping cart functionality
- ✅ Responsive design

## **If You Want Real Database Later**
1. Update MongoDB password in `server/.env`
2. Run `npm run dev` instead of `npm run simple`
3. All features will use real MongoDB

## **Troubleshooting**
- **Port 4000 in use?** → Kill process or change port in `simple-server.js`
- **Frontend errors?** → Refresh browser (Ctrl+F5)
- **Can't connect?** → Make sure both servers are running

**Your marketplace is ready to use! 🎉**