# Firebase Setup Guide

## Bước 1: Tạo Service Account Key

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Settings** (⚙️) → **Project settings**
4. Chuyển sang tab **Service accounts**
5. Click **Generate new private key**
6. Download file JSON

## Bước 2: Setup Local Environment

1. Copy file JSON vừa download vào thư mục `config/`
2. Đổi tên file thành `serviceAccountKey.json`
3. Hoặc sử dụng biến môi trường `FIREBASE_SERVICE_ACCOUNT`

```bash
# Sử dụng file JSON
cp downloaded-file.json config/serviceAccountKey.json

# Hoặc sử dụng environment variable
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

## Bước 3: Kiểm tra

Chạy server và kiểm tra log:
```bash
npm start
```

Bạn sẽ thấy:
```
✅ Firebase Admin SDK initialized successfully
📦 Storage bucket name: your-project.firebasestorage.app
✅ Firebase Storage connection test successful
```

## ⚠️ Security Notes

- **KHÔNG BAO GIỜ** commit file `serviceAccountKey.json` lên Git
- File này đã được thêm vào `.gitignore`
- Mỗi developer cần tạo service account key riêng
- Trong production, sử dụng environment variables

## Troubleshooting

### Lỗi "Invalid JWT Signature"
- Service account key đã hết hạn → Tạo lại key mới
- Thời gian máy không đồng bộ → Chạy `w32tm /resync` (Windows)

### Lỗi "Firebase not properly initialized"
- Kiểm tra file `serviceAccountKey.json` có đúng format không
- Kiểm tra project ID và bucket name
- Restart server sau khi update key
