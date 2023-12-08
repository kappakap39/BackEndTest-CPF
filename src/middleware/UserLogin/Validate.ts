import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

//! เช็คว่ามีข้อมูลใน Email และ password ไหม
const CheckInput = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();
    try {
        const { UserEmail } = req.params;
        const { UserPassword } = req.params;
        if (UserEmail.length) {
            if (UserPassword.length) {
                console.log("Hmm...")
                next();
            } else {
                res.status(403).json({ error: 'Please fill in information Password' });
            }
        } else {
            res.status(403).json({ error: 'Please fill in information Email' });
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect(); // ปิดการเชื่อมต่อ Prisma client หลังจากใช้งาน
    }
};

//!เช็คว่าเป็น Email ไหม

//!เช็คว่าเป็น Password ไหม

//! เช็คว่ามี Email และ password ไหม
const CheckValidate = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();
    try {
        const { UserEmail } = req.params;
        const { UserPassword } = req.params;

        const UserAll = await prisma.user.findMany();
        const EmailUser = UserAll.find(user => user.Email === UserEmail && user.Password === UserPassword);

        if (EmailUser) {
            console.log('User :', EmailUser);
            res.status(200).json({ User: EmailUser });
        } else {
            res.status(403).json({ error: 'Email or Password not found' });
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect(); // ปิดการเชื่อมต่อ Prisma client หลังจากใช้งาน
    }
};

export { CheckValidate, CheckInput } ;