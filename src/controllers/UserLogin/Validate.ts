import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Joi from 'joi';

//! เช็คว่ามีข้อมูลใน Email และ password ไหม
const CheckInput = async (req: Request, res: Response, next: NextFunction) => {
    const { Email } = req.body;
    const { Password } = req.body;
    console.log('Check:', Email, Password);
    if (Email && Password) {
        next();
    } else {
        res.status(403).json({ error: 'CheckInput Email or Password not found' });
    }
};

//! เช็คว่ามี Email และ password ไหม
const CheckValidate = async (req: any, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();

    const { Email } = req.body;
    const { Password } = req.body;

    // Validate email format using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
        res.status(403).json({ error: 'CheckValidate: Invalid email format' });
        return;
    }

    // const UserAll = await prisma.user.findUnique();
    const UserAll = await prisma.user.findUnique({
        where: {
            Email: Email,
        },
    });

    if (UserAll) {
        // ใช้ Bcrypt เพื่อแฮชรหัสผ่าน
        const passwordMatch = await bcrypt.compare(Password, UserAll.Password);
        if (passwordMatch) {
            console.log('User :', UserAll);
            req.user = UserAll;
            next();
            // res.status(200).json({ User: UserAll });
        } else {
            res.status(403).json({ error: 'Password in correct' });
        }
    } else {
        res.status(403).json({ error: 'None User' });
    }
};

export { CheckValidate, CheckInput };
