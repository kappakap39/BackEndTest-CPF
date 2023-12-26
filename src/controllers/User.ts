import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomHelpers } from 'joi';
import nodemailer from 'nodemailer';
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../lib/db';
const fs = require('fs');


const getUserAll: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany();
        if (users.length === 0) {
            return res.status(404).json({ users: 'None users' });
        }

        // Map users and add FullnameFL property
        const usersWithFullnameFL = users.map((user) => ({
            ...user,
            FullnameFL: `${user.FirstName} ${user.LastName}`,
            // PasswordHASH: password,
        }));

        return res.json(usersWithFullnameFL);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

<<<<<<< HEAD
//!ADD Users
const addUser: RequestHandler = async (req, res) => {
=======
//!ADD Users to IMG
const storage = multer.diskStorage({
    destination: './assets/uploads',
    // destination: path.join(__dirname, './assets/uploads')
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});
// const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    // limits: { fileSize: 1024 * 1024 * 150 }, // 150 MB
}).single('file');

const addUserIMG: RequestHandler = async (req, res) => {
    // create schema object
    const schema = Joi.object({
        Email: Joi.string().min(1).max(255).required(),
        Password: Joi.string().min(1).max(255).required(),
        FirstName: Joi.string().min(1).max(255).required(),
        LastName: Joi.string().min(1).max(255).required(),
        Level: Joi.string().min(1).max(255),
        Otp: Joi.string().min(1).max(255),
        OtpExpired: Joi.date(),
        Address: Joi.object({
            province: Joi.string().max(255).required(),
            district: Joi.string().max(255).required(),
            subdistrict: Joi.string().max(255).required(),
            Additional: Joi.string().max(255).required(),
        }).max(255),
        Tel: Joi.string().min(1).max(10).required(),
        Status: Joi.boolean(),
        Remove: Joi.boolean(),
        Active: Joi.boolean(),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    // validate request body against schema
    const { error, value: validatedData } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const prisma = new PrismaClient();

    try {
        const duplicateUser = await prisma.user.findMany({
            where: {
                OR: [{ Email: { contains: validatedData.Email } }, { Tel: { contains: validatedData.Tel } }],
            },
        });

        if (duplicateUser && duplicateUser.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'Email or Tel is duplicate in the database.',
                data: {
                    Email: validatedData.Email,
                    Tel: validatedData.Tel,
                },
            });
        }

        upload(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ success: false, error: 'File upload failed' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            // const filePath = req.file.path;
            const filePath = path.join(__dirname, req.file.path);
            const fileName = path.basename(filePath);
            // ใช้ Bcrypt เพื่อแฮชรหัสผ่าน
            const hashedPassword = await bcrypt.hash(validatedData.Password, 10);

            const payloadUser = {
                Email: validatedData.Email.toLowerCase(),
                Password: hashedPassword,
                FirstName: validatedData.FirstName.toLowerCase(),
                LastName: validatedData.LastName.toLowerCase(),
                Level: validatedData.Level.toLowerCase(),
                Img: fileName,
                Otp: validatedData.Otp,
                OtpExpired: validatedData.OtpExpired,
                // FullName: `${validatedData.FirstName} ${validatedData.LastName}`, // Assuming 'FullName' is a combination of first and last name
                Address: validatedData.Address,
                Tel: validatedData.Tel,
                Status: validatedData.Status,
                Remove: validatedData.Remove,
                Active: validatedData.Active,
            };
            const user = await prisma.user.create({
                data: payloadUser,
            });
            return res.status(201).json(user);
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: error,
        });
    }
};

//!ADD Users
const addUserAll: RequestHandler = async (req, res) => {
>>>>>>> 65905ce2decc89fbcad5bc52200cceb6e88540b0
    // create schema object
    const schema = Joi.object({
        Email: Joi.string().min(1).max(255).required(),
        Password: Joi.string().min(1).max(255).required(),
        FirstName: Joi.string().min(1).max(255).required(),
        LastName: Joi.string().min(1).max(255).required(),
        Level: Joi.string().min(1).max(255),
        Otp: Joi.string().min(1).max(255),
        OtpExpired: Joi.date(),
        Address: Joi.object({
            province: Joi.string().max(255).required(),
            district: Joi.string().max(255).required(),
            subdistrict: Joi.string().max(255).required(),
            Additional: Joi.string().max(255).required(),
        }).max(255),
        Tel: Joi.string().min(1).max(10).required(),
        Status: Joi.boolean(),
        Remove: Joi.boolean(),
        Active: Joi.boolean(),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    // validate request body against schema
    const { error, value: validatedData } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const prisma = new PrismaClient();

    try {
        const duplicateUser = await prisma.user.findMany({
            where: {
                OR: [{ Email: { contains: validatedData.Email } }, { Tel: { contains: validatedData.Tel } }],
            },
        });

        if (duplicateUser && duplicateUser.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'Email or Tel is duplicate in the database.',
                data: {
                    Email: validatedData.Email,
                    Tel: validatedData.Tel,
                },
            });
        }

        // ใช้ Bcrypt เพื่อแฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(validatedData.Password, 10);

        const payloadUser = {
            Email: validatedData.Email.toLowerCase(),
            Password: hashedPassword,
            FirstName: validatedData.FirstName.toLowerCase(),
            LastName: validatedData.LastName.toLowerCase(),
            Level: validatedData.Level.toLowerCase(),
            Otp: validatedData.Otp,
            OtpExpired: validatedData.OtpExpired,
            // FullName: `${validatedData.FirstName} ${validatedData.LastName}`, // Assuming 'FullName' is a combination of first and last name
            Address: validatedData.Address,
            Tel: validatedData.Tel,
            Status: validatedData.Status,
            Remove: validatedData.Remove,
            Active: validatedData.Active,
        };

        const user = await prisma.user.create({
            data: payloadUser,
        });

        return res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: error,
        });
    }
};

//!Update User
const updateUser: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        UserID: Joi.string().uuid().required(),
    });

    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
    };

    const { error } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const body = req.body;
    const prisma = new PrismaClient();

    return await prisma.$transaction(async function (tx) {
        const payload: any = {};

        const checkUser = await tx.user.findFirst({
            where: {
                UserID: body.UserID,
            },
        });
        if (!checkUser) {
            return res.status(422).json({ error: 'checkUser not found' });
        }

        if (body.Email) {
            payload['Email'] = body.Email.toLowerCase();
        }

        if (body.Password) {
            payload['Password'] = body.Password;
        }

        if (body.FirstName) {
            payload['FirstName'] = body.FirstName.toLowerCase();
        }

        if (body.LastName) {
            payload['LastName'] = body.LastName.toLowerCase();
        }
        if (body.Level) {
            payload['Level'] = body.Level.toLowerCase();
        }
        if (body.Otp) {
            payload['Otp'] = body.Otp;
        }

        if (body.OtpExpired) {
            payload['OtpExpired'] = body.OtpExpired;
        }

        if (body.Address) {
            payload['Address'] = body.Address;
        }

        if (body.Tel) {
            payload['Tel'] = body.Tel;
        }

        if (body.Status) {
            payload['Status'] = body.Status;
        }

        if (body.Remove) {
            payload['Remove'] = body.Remove;
        }

        if (body.Active) {
            payload['Active'] = body.Active;
        }

        const update = await tx.user.update({
            where: {
                UserID: body.UserID,
            },
            data: payload,
        });

        return res.json(update);
    });
};


//!Delete User
const deleteUser: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        UserID: Joi.string().uuid().required(),
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

    const query: any = req.query;
    const prisma = new PrismaClient();

    return await prisma.$transaction(async function (tx) {
        const deletePeople = await tx.user.delete({
            where: {
                UserID: query.UserID,
            },
        });
        return res.json(deletePeople);
    });
};

//!Get User By ID
const getUserByID: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { UserIDInput } = req.params;
        const userByID = await prisma.user.findMany({
            where: {
                UserID: UserIDInput,
            },
        });

        if (!userByID) {
            return res.status(404).json({ error: 'userID not found' });
        }

        return res.json(userByID);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

export {
    getUserAll,
<<<<<<< HEAD
    addUser,
    updateUser,
    deleteUser,
    getUserByID
=======
    addUserAll,
    updateUserAll,
    deleteUserAll,
    getUserByID,
    searchUserByEmail,
    searchUserByFirstName,
    searchUserByEF,
    searchUserByEorF,
    addUserIMG,
>>>>>>> 65905ce2decc89fbcad5bc52200cceb6e88540b0
};
