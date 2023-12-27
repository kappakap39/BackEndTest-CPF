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

const getUserORAdmin: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const UserOrAdmin = await prisma.userManagement.findMany();
        if (UserOrAdmin.length === 0) {
            return res.status(404).json({ users: 'None users' });
        }
        return res.json(UserOrAdmin);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!ADD Users
const addUserOrAdmin: RequestHandler = async (req, res) => {
    // สร้าง schema object
    const schema = Joi.object({
        UserName: Joi.string().min(1).max(255).required(),
        Password: Joi.string().min(1).max(255).required(),
        Pincode: Joi.string().min(1).max(255).required(),
        FirstName: Joi.string(),
        LastName: Joi.string(),
        UserLevel: Joi.string(),
        EffectiveDate: Joi.date(),
        ExpiredDate: Joi.date(),
        SecretQuestion: Joi.string(),
        Answer: Joi.string(),
        Status: Joi.boolean(),
    });

    // ตัวเลือกของ schema
    const options = {
        abortEarly: false, // รวมข้อผิดพลาดทั้งหมด
        allowUnknown: true, // ละเว้น prop ที่ไม่รู้จัก
        stripUnknown: true, // ลบ prop ที่ไม่รู้จัก
    };

    // ตรวจสอบ request body ตาม schema
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
        const duplicateUser = await prisma.userManagement.findMany({
            where: {
                OR: [{ UserName: { contains: validatedData.UserName } },],
            },
        });

        if (duplicateUser && duplicateUser.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'Email or Tel is duplicate in the database.',
                data: {
                    UserName: validatedData.UserName,
                },
            });
        }

        // ใช้ Bcrypt เพื่อแฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(validatedData.Password, 10);

        const payloadUser = {
            UserName: validatedData.UserName.toLowerCase(),
            Password: hashedPassword,
            FirstName: validatedData.FirstName,
            LastName: validatedData.LastName,
            Pincode: validatedData.Pincode,
            UserLevel: validatedData.UserLevel,
            EffectiveDate: validatedData.EffectiveDate,
            ExpiredDate: validatedData.ExpiredDate,
            SecretQuestion: validatedData.SecretQuestion,
            Answer: validatedData.Answer,
            Status: validatedData.Status,
        };

        const userOrAdmin = await prisma.userManagement.create({
            data: payloadUser,
        });

        return res.status(201).json(userOrAdmin);
    } catch (error) {
        console.error('Error creating userOrAdmin:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: error,
        });
    }
};

const deleteUserOrAdmin: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        IDUserOrAdmin: Joi.string().uuid().required(),
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
        const deletePeople = await tx.userManagement.delete({
            where: {
                IDUserOrAdmin: query.IDUserOrAdmin,
            },
        });
        return res.json(deletePeople);
    });
};

//!Update User
const updateUserOrAdmin: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        IDUserOrAdmin: Joi.string().uuid().required(),
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

        const checkUserAdmin = await tx.userManagement.findFirst({
            where: {
                IDUserOrAdmin: body.IDUserOrAdmin,
            },
        });
        if (!checkUserAdmin) {
            return res.status(422).json({ error: 'checkUser not found' });
        }

        if (body.UserName) {
            payload['UserName'] = body.UserName.toLowerCase();
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
        if (body.Pincode) {
            payload['Pincode'] = body.Pincode;
        }
        if (body.UserLevel) {
            payload['UserLevel'] = body.UserLevel;
        }

        if (body.EffectiveDate) {
            payload['EffectiveDate'] = body.EffectiveDate;
        }

        if (body.ExpiredDate) {
            payload['ExpiredDate'] = body.ExpiredDate;
        }

        if (body.SecretQuestion) {
            payload['SecretQuestion'] = body.SecretQuestion;
        }
        
        if (body.Answer) {
            payload['Answer'] = body.Answer;
        }

        if (body.Status) {
            payload['Status'] = body.Status;
        }

        const update = await tx.userManagement.update({
            where: {
                IDUserOrAdmin: body.IDUserOrAdmin,
            },
            data: payload,
        });

        return res.json(update);
    });
};

export {
    getUserORAdmin,
    addUserOrAdmin,
    deleteUserOrAdmin,
    updateUserOrAdmin
};
