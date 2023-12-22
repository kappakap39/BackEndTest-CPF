import express, { Request, Response, NextFunction } from 'express';
import multer, { Multer } from 'multer';
import path from 'path';
import prisma from '../lib/db';
import { PrismaClient } from '@prisma/client';
import Joi, { any } from 'joi';
const fs = require('fs');
import { generateFileKey } from '../Utils/Upload';
// import { upload } from '../Utils/Upload';
// const storage = multer.diskStorage({

//     destination:  './assets/uploads'
//     // destination: path.join(__dirname, './assets/uploads')
//     ,
//     filename: (req, file, cb) => {
//         cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//     },
// });

// // const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     // limits: { fileSize: 1024 * 1024 * 150 }, // 150 MB
// }).single('file');

//! add
const UpFile = async (req: Request, res: Response, next: NextFunction) => {
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
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }

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

            const files: any = req.files; // Use req.files instead of req.file
            const uploadedFiles = files.map((file: any) => ({
                OriginalName: file.originalname,
                Mimetype: file.mimetype,
                FileName: file.filename,
                FilePath: file.path,
                FileSize: file.size.toString(),
                FileKey: generateFileKey(),
                UserID: userID,
            }));

            // บันทึกข้อมูลลงในฐานข้อมูล
            const createdFiles = await prisma.file.createMany({
                data: uploadedFiles,
            });

            // ตรวจสอบว่าข้อมูลถูกสร้างในฐานข้อมูลหรือไม่
            if (createdFiles.count !== uploadedFiles.length) {
                console.log('Some files were not saved to the database');
                return res.status(500).json({ success: false, message: 'Some files were not saved to the database' });
            }

            // ส่ง JSON response แจ้งให้ทราบว่าไฟล์ถูกอัปโหลดสำเร็จ
            return res.status(200).json({ success: true, message: 'File uploaded successfully', uploadedFiles });
        } else {
            console.log('Token not found');
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//! add
const UpFileSingle = async (req: Request, res: Response, next: NextFunction) => {
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
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

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

            const file = req.file; // Use req.file for single file upload
            const uploadedFile = {
                OriginalName: file.originalname,
                Mimetype: file.mimetype,
                FileName: file.filename,
                FilePath: file.path,
                FileSize: file.size.toString(),
                FileKey: generateFileKey(),
                UserID: userID,
            };

            // บันทึกข้อมูลลงในฐานข้อมูล
            const createdFile = await prisma.file.create({
                data: uploadedFile,
            });

            // ตรวจสอบว่าข้อมูลถูกสร้างในฐานข้อมูลหรือไม่
            if (!createdFile) {
                console.log('File was not saved to the database');
                return res.status(500).json({ success: false, message: 'File was not saved to the database' });
            }

            // ส่ง JSON response แจ้งให้ทราบว่าไฟล์ถูกอัปโหลดสำเร็จ
            return res.status(200).json({ success: true, message: 'File uploaded successfully', uploadedFile });
        } else {
            console.log('Token not found');
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


//! get all
const showFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const File = await prisma.file.findMany();
        if (File.length === 0) {
            return res.status(404).json({ users: 'None users' });
        }
        return res.json(File);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//! ShowFile By Name
const showFileName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileName = req.query.fileName as string; // Assuming fileName is the correct query parameter name
        console.log(req.query);
        const schema = Joi.object({
            fileName: Joi.string().required(), // Use fileName instead of FileName
        });

        const options = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };

        const { error } = schema.validate(req.query, options);

        if (error) {
            return res.status(422).json({
                status: 422,
                message: 'Unprocessable Entity',
                data: error.details,
            });
        }

        const file = await prisma.file.findFirst({
            where: {
                FileName: fileName, // ระบุชื่อไฟล์ที่ต้องการค้นหาในฐานข้อมูล
            },
        });

        if (!file) {
            return res.status(404).json({
                error: 'File not found in the database.',
            });
        }

        return res.json(file);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//! delete file
const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileName = req.query.FileName as string; // Assuming fileName is the correct query parameter name
        console.log(req.query);
        const schema = Joi.object({
            FileName: Joi.string().required(), // Use fileName instead of FileName
        });

        const options = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };

        const { error } = schema.validate(req.query, options);

        if (error) {
            return res.status(422).json({
                status: 422,
                message: 'Unprocessable Entity',
                data: error.details,
            });
        }

        return await prisma.$transaction(async function (tx) {
            // ค้นหาข้อมูลของไฟล์ที่ต้องการลบ
            const fileToDelete = await tx.file.findFirst({
                where: {
                    FileName: fileName,
                },
            });

            const filePath = './assets/uploads/' + fileName;
            // const filePath = path.join( __dirname, './assets/uploads/' + fileName);
            // const filePath = path.join(__dirname, 'assets', 'uploads', fileName);
            console.log('filePath', filePath);

            // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
            if (fs.existsSync(filePath)) {
                // ลบไฟล์
                fs.unlinkSync(filePath);
            } else {
                return res.status(404).json({
                    error: 'File not found.',
                });
            }

            // ถ้าไม่พบไฟล์ที่ต้องการลบ
            if (!fileToDelete) {
                return res.status(404).json({
                    error: 'File not found in the database.',
                });
            }

            // ถ้าพบไฟล์ที่ต้องการลบ ให้ทำการลบ
            const deleteFile = await tx.file.delete({
                where: {
                    FileName: fileName,
                },
            });

            return res.json(deleteFile);
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export { UpFile, showFile, showFileName, deleteFile, UpFileSingle };
