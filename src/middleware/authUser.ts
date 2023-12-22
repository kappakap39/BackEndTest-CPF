import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import { ErrorRequestHandler } from 'express';
import config from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import Joi from 'joi';

// กำหนดฟังก์ชั่นสำหรับตรวจสอบ verifyToken Token
// ให้ฟังก์ชัน verifyToken รับค่าเป็น union type
const verifyToken = (tokenCheck: string, SECRET_KEY: string) => {
    try {
        const decoded = jwt.verify(tokenCheck, SECRET_KEY);
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

// Middleware สำหรับตรวจสอบ Token ใน Header
const authToken: RequestHandler = async (req, res, next) => {
    // ตรวจสอบการมี Header Authorization ใน Request
    const checkHeader = req.headers.authorization;

    if (!checkHeader) {
        return res.status(403).json({ error: 'Header not found' });
    }

    try {
        // แยก Token จาก Header
        const tokenCheck = checkHeader.split(' ')[1];
        // const [, tokenCheck] = checkHeader.split(' ');

        if (!tokenCheck) {
            return res.status(403).json({ error: 'Token not provided' });
        }

        //!verifyToken

        // กำหนดคีย์ลับสำหรับการสร้างและตรวจสอบ Token
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

        // console.log('Token:', JSON.stringify(tokenCheck));
        // console.log('SECRET_KEY:', JSON.stringify(SECRET_KEY));

        // ตรวจสอบ Token ด้วยฟังก์ชั่น verifyToken
        const decodedToken = verifyToken(tokenCheck, SECRET_KEY) as { UserID: string; exp: number };
        console.log('decodedToken:', decodedToken.UserID);

        // หาก Token ถูกต้อง มีในฐานข้อมูล
        if (decodedToken) {
            // if (tokenCheck === SECRET_KEY) {
            console.log('Decoded Token:', decodedToken);
            // ส่งต่อไปยัง middleware ถัดไป
        } else {
            // Token ไม่ถูกต้องหรือหมดอายุ
            return res.status(403).json({ error: 'Invalid Token Database', decodedToken });
        }

        // เช็คว่าเป็น token ใคร
        const tokenUser = await prisma.token.findFirst({
            where: {
                TokenValue: tokenCheck,
                UserID: decodedToken.UserID,
                Expiration: {
                    gte: new Date(),
                },
            },
        });

        if (!tokenUser) {
            return res.status(403).json({ error: 'Invalid Token', details: 'Invalid token User' });
        }

        // ตรวจสอบ Expired Time
        if (tokenUser.Expiration < new Date()) {
            return res.status(403).json({ error: 'Expired Token' });
        }

        if (tokenUser) {
            console.log('tokenUser.Expiration:', tokenUser.Expiration);
        }

        //หาชั่วโมง และนาทีที่จะหมดอายุ
        if (decodedToken.exp) {
            const expiresInMilliseconds = decodedToken.exp * 1000 - Date.now();
            // const expiresInHours = expiresInMilliseconds / (1000 * 60 * 60);
            const expiresInMinutes = Math.floor(expiresInMilliseconds / (1000 * 60));
            const hours = Math.floor(expiresInMinutes / 60); // หารเพื่อหาจำนวนชั่วโมง
            const remainingMinutes = expiresInMinutes % 60; // นาทีที่เหลือ

            console.log('Token will expire in', hours, 'hours and', remainingMinutes, 'minutes');
        }

        next();
    } catch (error) {
        console.error('checkHeader error:', error);
        res.status(500).json({ success: false, error: 'req.headers.authorization Server Error' });
    }
};

const authTokenOTP: RequestHandler = async (req, res, next) => {
    // ตรวจสอบการมี Header Authorization ใน Request
    const checkHeader = req.headers.authorization;

    if (!checkHeader) {
        return res.status(403).json({ error: 'Header not found' });
    }

    try {
        // แยก Token จาก Header
        const tokenCheck = checkHeader.split(' ')[1];
        // const [, tokenCheck] = checkHeader.split(' ');

        if (!tokenCheck) {
            return res.status(403).json({ error: 'Token not provided' });
        }

        //!verifyToken

        // กำหนดคีย์ลับสำหรับการสร้างและตรวจสอบ Token
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

        // console.log('Token:', JSON.stringify(tokenCheck));
        // console.log('SECRET_KEY:', JSON.stringify(SECRET_KEY));

        // ตรวจสอบ Token ด้วยฟังก์ชั่น verifyToken
        const decodedToken = verifyToken(tokenCheck, SECRET_KEY) as { UserID: string; exp: number };
        console.log('decodedToken:', decodedToken.UserID);

        // หาก Token ถูกต้อง มีในฐานข้อมูล
        if (decodedToken) {
            // if (tokenCheck === SECRET_KEY) {
            console.log('Decoded Token:', decodedToken);
            // ส่งต่อไปยัง middleware ถัดไป
        } else {
            // Token ไม่ถูกต้องหรือหมดอายุ
            return res.status(403).json({ error: 'Invalid Token Database', decodedToken });
        }

        // เช็คว่าเป็น token ใคร
        const tokenUser = await prisma.token.findFirst({
            where: {
                TokenValue: tokenCheck,
                UserID: decodedToken.UserID,
                Expiration: {
                    gte: new Date(),
                },
            },
        });

        if (!tokenUser) {
            return res.status(403).json({ error: 'Invalid Token', details: 'Invalid token User' });
        }

        // ตรวจสอบ Expired Time
        if (tokenUser.Expiration < new Date()) {
            return res.status(403).json({ error: 'Expired Token' });
        }

        if (tokenUser) {
            console.log('tokenUser.Expiration:', tokenUser.Expiration);
        }

        //หาชั่วโมง และนาทีที่จะหมดอายุ
        if (decodedToken.exp) {
            const expiresInMilliseconds = decodedToken.exp * 1000 - Date.now();
            // const expiresInHours = expiresInMilliseconds / (1000 * 60 * 60);
            const expiresInMinutes = Math.floor(expiresInMilliseconds / (1000 * 60));
            const hours = Math.floor(expiresInMinutes / 60); // หารเพื่อหาจำนวนชั่วโมง
            const remainingMinutes = expiresInMinutes % 60; // นาทีที่เหลือ

            console.log('Token will expire in', hours, 'hours and', remainingMinutes, 'minutes');
        }

        next();
    } catch (error) {
        console.error('checkHeader error:', error);
        res.status(500).json({ success: false, error: 'req.headers.authorization Server Error' });
    }
};

const UserToken: RequestHandler = async (req, res, next) => {
    // ตรวจสอบการมี Header Authorization ใน Request
    const checkHeader = req.headers.authorization;
    const KeyToken = req.query.UserToToken as string;

    if (!checkHeader) {
        return res.status(403).json({ error: 'Header not found' });
    }
    if (!KeyToken) {
        return res.status(403).json({ error: 'tokenKey Input not found' });
    }
    const tokenKey = await prisma.token.findFirst({
        where: {
            TokenValue: KeyToken,
        },
    });
    if (!tokenKey) {
        return res.status(403).json({ error: 'token Key not Token' });
    }

    // ตรวจสอบ Expired Time
    if (tokenKey.Expiration < new Date()) {
        return res.status(403).json({ error: 'Expired Token input' });
    }

    //หาชั่วโมง และนาทีที่จะหมดอายุ
    if (tokenKey.Expiration) {
        const expiresInMilliseconds = tokenKey.Expiration.getTime() - Date.now(); // แปลง Expiration เป็น milliseconds และคำนวณเวลาที่เหลือ
        const expiresInMinutes = Math.floor(expiresInMilliseconds / (1000 * 60)); // แปลง milliseconds เป็น minutes
        const hours = Math.floor(expiresInMinutes / 60); // หารเพื่อหาจำนวนชั่วโมง
        const remainingMinutes = expiresInMinutes % 60; // นาทีที่เหลือ
    
        console.log('Token input will expire in', hours, 'hours and', remainingMinutes, 'minutes');
    }    

    try {
        // แยก Token จาก Header
        const tokenCheck = checkHeader.split(' ')[1];
        // const [, tokenCheck] = checkHeader.split(' ');

        if (!tokenCheck) {
            return res.status(403).json({ error: 'Token not provided' });
        }

        //!verifyToken

        // กำหนดคีย์ลับสำหรับการสร้างและตรวจสอบ Token
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

        // console.log('Token:', JSON.stringify(tokenCheck));
        // console.log('SECRET_KEY:', JSON.stringify(SECRET_KEY));

        // ตรวจสอบ Token ด้วยฟังก์ชั่น verifyToken
        const decodedToken = verifyToken(tokenCheck, SECRET_KEY) as { UserID: string; exp: number };
        // console.log('decodedToken:', decodedToken.UserID);

        // หาก Token ถูกต้อง มีในฐานข้อมูล
        if (decodedToken) {
            // if (tokenCheck === SECRET_KEY) {
            console.log('Decoded Token:', decodedToken);
            // ส่งต่อไปยัง middleware ถัดไป
        } else {
            // Token ไม่ถูกต้องหรือหมดอายุ
            return res.status(403).json({ error: 'Invalid Token Database', decodedToken });
        }

        // เช็คว่าเป็น token ใคร
        const tokenUser = await prisma.token.findFirst({
            where: {
                TokenValue: tokenCheck,
                UserID: decodedToken.UserID,
                Expiration: {
                    gte: new Date(),
                },
            },
        });

        if (!tokenUser) {
            return res.status(403).json({ error: 'Invalid Token', details: 'Invalid token User' });
        }

        // ตรวจสอบ Expired Time
        if (tokenUser.Expiration < new Date()) {
            return res.status(403).json({ error: 'Expired Token' });
        }

        // if (tokenUser) {
        //     console.log('tokenUser.Expiration:', tokenUser.Expiration);
        // }

        //หาชั่วโมง และนาทีที่จะหมดอายุ
        if (decodedToken.exp) {
            const expiresInMilliseconds = decodedToken.exp * 1000 - Date.now();
            // const expiresInHours = expiresInMilliseconds / (1000 * 60 * 60);
            const expiresInMinutes = Math.floor(expiresInMilliseconds / (1000 * 60));
            const hours = Math.floor(expiresInMinutes / 60); // หารเพื่อหาจำนวนชั่วโมง
            const remainingMinutes = expiresInMinutes % 60; // นาทีที่เหลือ

            console.log('Token will expire in', hours, 'hours and', remainingMinutes, 'minutes');
        }

        next();
    } catch (error) {
        console.error('checkHeader error:', error);
        res.status(500).json({ success: false, error: 'req.headers.authorization Server Error' });
    }
};

export { authToken, authTokenOTP, UserToken };
