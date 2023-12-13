import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import Joi from 'joi';

require('dotenv').config();
const expirationTime = process.env.EXPIRATION_TIME;
// const expirationTime = process.env.EXPIRATION_TIME || 3600000;

//! Add Token
const AddToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Email, Password } = req.body;

        // ตรวจสอบความถูกต้องของข้อมูลที่รับมา
        const schema = Joi.object({
            Email: Joi.string().email().min(1).max(255).required(),
            Password: Joi.string().min(1).max(255).required(),
        });

        // กำหนดตัวเลือกสำหรับการตรวจสอบข้อมูล
        const optionsError = {
            abortEarly: false, // แสดงทุกข้อผิดพลาด
            allowUnknown: true, // ละเว้น properties ที่ไม่รู้จัก
            stripUnknown: true, // ลบ properties ที่ไม่รู้จัก
        };

        // ทำการตรวจสอบข้อมูล
        const { error } = schema.validate(req.body, optionsError);

        if (error) {
            return res.status(422).json({
                status: 422,
                Message: 'Unprocessable Entity',
                data: error.details,
            });
        }

        // แปลงทุกตัวอักษรใน Email และ Password เป็นตัวพิมเล็ก
        const lowercasedEmail = Email.toLowerCase();
        // const lowercasedPassword = Password.string().toLowerCase();
        // const lowercasedEmail = Email ? Email.toLocaleLowerCase() : '';
        // const lowercasedPassword = Password ? Password.toLocaleLowerCase() : '';

        // ตรวจสอบรูปแบบของ Email โดยใช้ regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(lowercasedEmail)) {
            return res.status(403).json({ error: 'Check: Invalid email format' });
        }

        // ค้นหาข้อมูลผู้ใช้จากฐานข้อมูล
        const user = await prisma.user.findUnique({
            where: {
                Email: lowercasedEmail,
            },
        });

        if (!user) {
            return res.status(403).json({ error: 'None User' });
        }

        // ตรวจสอบความถูกต้องของรหัสผ่าน
        const passwordMatch = await bcrypt.compare(Password, user.Password);

        if (!passwordMatch) {
            return res.status(403).json({ error: 'Password incorrect' });
        }

        // ตรวจสอบว่า Email และ Password ถูกส่งมาหรือไม่
        if (!lowercasedEmail || !Password) {
            return res.status(403).json({ error: 'Check: Email or Password not found' });
        }

        // กำหนดคีย์ลับสำหรับการสร้าง Token
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

        // กำหนดข้อมูลที่จะใส่ใน Token
        const payloadUser = {
            UserID: user.UserID,
        };

        // กำหนดตัวเลือกในการสร้าง Token
        // const options = {
        //     expiresIn: '1h',
        // };

        // สร้าง Token
        const token = jwt.sign(payloadUser, SECRET_KEY, { expiresIn: expirationTime });

        if (token) {
            // บันทึก Token ลงในฐานข้อมูล
            await prisma.token.create({
                data: {
                    TokenValue: token,
                    UserID: user.UserID,
                    Expiration: new Date(Date.now() + Number(expirationTime)),
                },
            });
        } else {
            return res.status(402).json({ message: 'None found token' });
        }

        // ยืนยัน Token และดึงข้อมูลที่ถอดรหัสได้
        let decoded = null;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            console.log(err);
        }

        // ส่งข้อมูล Token และข้อมูลที่ถอดรหัสได้กลับ
        return res.status(200).json({ token, decoded });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // ปิดการเชื่อมต่อกับฐานข้อมูล
        await prisma.$disconnect();
    }
};

const verifyToken = (tokenCheck: string, SECRET_KEY: string) => {
    try {
        const decoded = jwt.verify(tokenCheck, SECRET_KEY);
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

//!Delete token
const Logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ error: 'Header not found' });
        }

        console.log('token to logout:', token);
        // กำหนดคีย์ลับสำหรับการสร้างและตรวจสอบ Token
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

        // ใช้ union type เพื่อระบุชนิดของ decodedToken
        const decodedToken = verifyToken(token, SECRET_KEY) as { UserID: string; exp: number};

        // ตรวจสอบว่า decodedToken ไม่เป็น null และมีคุณสมบัติ 'UserID'
        if (decodedToken.UserID) {
            // ในกรณีที่มี 'UserID', หากต้องการใช้ค่านี้ต่อในโค้ด
            const userID: string = decodedToken.UserID;
            console.log('Decoded Token:', decodedToken);

            // ทำการลบ Token หรืออื่น ๆ ตามที่คุณต้องการทำที่นี้
            // const tokenIndex = userTokens.indexOf(token);
            // if (tokenIndex !== -1) {
            //     userTokens.splice(tokenIndex, 1);
            // }

            res.json({ success: true, message: 'Logout successful' });
        } else {
            // ในกรณีที่ไม่มี 'UserID' หรือ decodedToken เป็น null
            return res.status(403).json({ error: 'Invalid Token' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export { AddToken, Logout };
