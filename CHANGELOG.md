# บันทึกการเปลี่ยนแปลง (Changelog)

บันทึกการเปลี่ยนแปลงที่สำคัญของโปรเจคนี้

รูปแบบอ้างอิงจาก [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) และใช้
[Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.1.0] - 2026-01-13

### ✨ ฟีเจอร์ใหม่ (Added)

- **GPT-Vis Chart Generation Module** - ระบบสร้าง Chart ฝั่ง Server
  - `POST /api/v1/generate-chart` - สร้าง Chart image จากข้อมูล
  - `GET /api/v1/generate-chart/images/:id` - ดึงรูป Chart ที่สร้างไว้
  - `DELETE /api/v1/generate-chart/images/:id` - ลบรูปและ metadata
- **File-based Image Caching** - ระบบ Cache รูปภาพแบบไฟล์ (ไม่ต้องใช้ MongoDB)
- **Swagger Documentation** - เอกสาร API ที่ `/docs` ใช้ `@elysiajs/swagger`
- **Error Handler Plugin** - จัดการ Error แบบ Global พร้อม `AppError` class
- **Logger Plugin** - ระบบ Log แบบ JSON สำหรับ Error และ Warning
- **App Configuration** - ตั้งค่าผ่าน Environment Variables (port, storage,
  expiry)

### 📦 Dependencies ที่เพิ่ม

| Package             | Version | รายละเอียด        |
| ------------------- | ------- | ----------------- |
| `@antv/gpt-vis-ssr` | ^0.3.3  | Render Chart      |
| `@elysiajs/swagger` | ^1.3.1  | API Documentation |
| `nanoid`            | ^5.1.6  | สร้าง Unique ID   |

### 📁 โครงสร้างโปรเจค

```
src/
├── config/app.ts           # ตั้งค่า Application
├── plugins/
│   ├── errorHandler.plugin.ts  # จัดการ Error
│   ├── logger.plugin.ts        # ระบบ Log
│   └── swagger.plugin.ts       # Swagger Config
├── cache/imageCache.ts     # ระบบ Cache รูปภาพ
└── modules/gpt-vis/
    ├── index.ts            # Controller (Routes)
    ├── service.ts          # Business Logic
    ├── model.ts            # Validation Schemas
    └── constants.ts        # Chart Type Constants
```

---

## [1.0.50] - ก่อนหน้า

### 🎉 เริ่มต้นโปรเจค

- ติดตั้ง Elysia Server พื้นฐาน
- Hello World endpoint

---

## หมวดหมู่ที่ใช้

| หมวดหมู่      | ความหมาย                 |
| ------------- | ------------------------ |
| ✨ Added      | ฟีเจอร์ใหม่              |
| 🔄 Changed    | การเปลี่ยนแปลง           |
| 🐛 Fixed      | แก้ไข Bug                |
| 🗑️ Removed    | ลบออก                    |
| ⚠️ Deprecated | จะถูกลบใน Version ถัดไป  |
| 🔒 Security   | แก้ไขช่องโหว่ความปลอดภัย |
| ♻️ Refactor   | ปรับโครงสร้างโค้ด        |
