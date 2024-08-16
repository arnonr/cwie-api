const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // สมมติว่า token อยู่ในรูปแบบ 'Bearer <token>'
    const secretKey = process.env.JWT_SECRET_KEY;
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ msg: err });
        }

        // เก็บข้อมูลผู้ใช้ที่ถอดรหัสไว้ใน req.user เพื่อใช้งานใน route ต่อไป
        req.user = decoded;
        next(); // เรียก `next` เพื่อดำเนินการต่อไปยัง route หรือ middleware ถัดไป
    });
}

module.exports = authMiddleware;
