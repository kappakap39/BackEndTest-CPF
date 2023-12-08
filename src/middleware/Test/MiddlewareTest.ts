import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const exampleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();
    try {
        const peopleData = await prisma.people.findMany();
        // console.log('peopleData', peopleData);
        // const { people } = req.params;
        // ตรวจสอบว่ามีข้อมูลบางรายการที่ตรงกับเงื่อนไขที่กำหนดหรือไม่
        // const hasMatchingPeopleID = peopleData.some(person => person.PeopleID === people);
        // if (peopleData.length > 0 && hasMatchingPeopleID) {
        if (peopleData.length > 0) {
            console.log('People Data success');
            next();
        } else {
            res.status(403).json({ error: 'People Data length < 0' });
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect(); // ปิดการเชื่อมต่อ Prisma client หลังจากใช้งาน
    }
};

export { exampleMiddleware };
