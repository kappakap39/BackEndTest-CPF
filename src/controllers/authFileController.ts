import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../lib/db';
import { PrismaClient } from '@prisma/client';

const storage = multer.diskStorage({
    destination: '../../assets/uploads',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    // limits: { fileSize: 1024 * 1024 * 150 }, // 150 MB
}).single('file');


const UpFile = async (req: Request, res: Response, next: NextFunction)  => {
    const checkHeader = req.headers.authorization?.split(' ')[1];
    console.log('checkHeader:', checkHeader);

    try {
        if (!checkHeader) {
            return res.status(403).json({ error: 'Header not found' });
        }

        const tokenuser = await prisma.token.findFirst({
            where: {
                TokenValue: checkHeader,
            },
        });

        if (tokenuser) {
            const userID = tokenuser.UserID;
            const user = await prisma.user.findUnique({
                where: {
                    UserID: userID,
                },
            });

            if (!user) {
                console.log('User not found');
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            upload(req, res, async (err) => {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ success: false, error: 'File upload failed' });
                }

                if (!req.file) {
                    return res.status(400).json({ success: false, message: 'No file uploaded' });
                }

                const filePath = req.file.path;
                const fileName = path.basename(filePath);

                await prisma.file.create({
                    data: {
                        FilePath: filePath,
                        FileName: fileName,
                        UserID: userID,
                    },
                });

                return res
                    .status(200)
                    .json({ success: true, message: 'File uploaded successfully', filePath, fileName });
            });
        } else {
            console.log('Token not found');
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export { UpFile };
