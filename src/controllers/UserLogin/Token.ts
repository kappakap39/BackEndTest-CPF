import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

//! เช็คว่ามี Email และ password ไหม
const AddToken = async (req: Request, res: Response, next: NextFunction) => {
    //!เรียกข้อมูลผู้ใช้ที่กรอกเมลมาเช็คหา
    const { Email } = req.body;
    const UserSingle = await prisma.user.findUnique({
        where: {
            Email: Email,
        },
    });
    // res.status(200).json({ User: UserAll });

    if (!UserSingle) {
        // Handle the case where the user is not found
        return res.status(404).json({ error: 'User not found' });
    }

    //!สร้าง SECRET_KEY process จากเครื่อง env ชื่อไฟล เรียก SECRET_KEY มาใช้
    const SECRET_KEY = process.env.SECRET_KEY ?? 'SECRET_KEY';

    //! สร้าง payload เพื่อกำหนดใส่ในรหัส Token
    const payloadUser = {
        UserID: UserSingle.UserID,
    };

    //! สร้างออฟชั่นกำหนดเวลา
    const options = {
        expiresIn: '1h',
    };

    //! สร้างโทเค็น payloadUser jwt.sign
    // const token = jwt.sign( SECRET_KEY, JSON.stringify(payloadUser), options);
    const token = jwt.sign(payloadUser, SECRET_KEY, options);
    await prisma.token.create({
        data: {
            TokenValue: token,
            UserID: UserSingle.UserID,
            Expiration: new Date(Date.now() + 1 * 60 * 60 * 1000),
        },
    });

    let decoded = null;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
      } catch(err) {
        // 
        console.log(err)
      }

    return res.status(200).json({ token, decoded });
};

export { AddToken };
