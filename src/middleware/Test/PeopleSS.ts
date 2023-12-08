import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const PeopleMd = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();
    try {
        const peopleData = await prisma.people.findMany();
        const { people } = req.params;
        // console.log('peopleData', peopleData);

        // หาคนที่ตรงกับ ID ที่ระบุ
        const foundPerson = peopleData.find(person => person.PeopleID === people);

        if (foundPerson) {
            console.log('ID People successfully');
            res.status(200).json({ People: 'successfully', foundPerson });
        } else {
            res.status(403).json({ error: 'error not found' });
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
};

export { PeopleMd };
