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

        //!Tab1
        UserName: Joi.string().min(1).max(255).required(),
        Password: Joi.string().min(1).max(255).required(),
        Pincode: Joi.string(),
        UserLevel: Joi.string(),
        EffectiveDate: Joi.date(),
        ExpiredDate: Joi.date(),
        InvalidPasswordCount: Joi.number(),
        SecretQuestion: Joi.string(),
        Answer: Joi.string(),
        Status: Joi.boolean(),

        //!Tab2
        // Title: Joi.string(),
        FirstName: Joi.string(),
        LastName: Joi.string(),
        // AbbreviateName: Joi.string(),
        Email: Joi.string(),
        // Telephone: Joi.string(),
        // CitiZenID: Joi.string(),
        // Picture: Joi.string(),

        //!Tab3
        // EmpNo: Joi.string(),
        // DeptCode: Joi.string(),
        // CompanyCode: Joi.string(),
        // OperationCode: Joi.string(),
        // SubOperationCode: Joi.string(),
        // CentralRefNo: Joi.string(),
        // BusinessType: Joi.string(),
        // DocIssueUnit: Joi.string(),
        // LockLocation: Joi.string(),
        // DeptFlag: Joi.string(),
        // GrpSubOperation: Joi.string(),
        // GrpOperationCode: Joi.string(),

        //!Tab3
        // DefaultLanguage: Joi.string(),
        // FontFamily: Joi.string(),
        // FontSize: Joi.number(),
        // DateFormat: Joi.string(),
        // TimeZone: Joi.string(),
        // AmountFormat: Joi.number()

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
                OR: [{ UserName: { contains: validatedData.UserName } }],
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
            //!Tab1
            UserName: validatedData.UserName,
            Password: hashedPassword,
            Pincode: validatedData.Pincode,
            UserLevel: validatedData.UserLevel,
            EffectiveDate: validatedData.EffectiveDate,
            ExpiredDate: validatedData.ExpiredDate,
            InvalidPasswordCount: validatedData.InvalidPasswordCount,
            SecretQuestion: validatedData.SecretQuestion,
            Answer: validatedData.Answer,
            Status: validatedData.Status,
            //!Tab2
            Title: validatedData.Title,
            FirstName: validatedData.FirstName,
            LastName: validatedData.LastName,
            AbbreviateName: validatedData.AbbreviateName,
            Email: validatedData.Email,
            Telephone: validatedData.Telephone,
            CitiZenID: validatedData.CitiZenID,
            Picture: validatedData.Picture,
            //!Tab3
            EmpNo: validatedData.EmpNo,
            DeptCode: validatedData.DeptCode,
            CompanyCode: validatedData.CompanyCode,
            OperationCode: validatedData.OperationCode,
            SubOperationCode: validatedData.SubOperationCode,
            CentralRefNo: validatedData.CentralRefNo,
            BusinessType: validatedData.BusinessType,
            DocIssueUnit: validatedData.DocIssueUnit,
            LockLocation: validatedData.LockLocation,
            DeptFlag: validatedData.DeptFlag,
            GrpSubOperation: validatedData.GrpSubOperation,
            GrpOperationCode: validatedData.GrpOperationCode,
            //!Tab4
            DefaultLanguage: validatedData.DefaultLanguage,
            FontFamily: validatedData.FontFamily,
            FontSize: validatedData.FontSize,
            DateFormat: validatedData.DateFormat,
            TimeZone: validatedData.TimeZone,
            AmountFormat: validatedData.AmountFormat,
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

//!delete
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

        //!Tab1
        if (body.UserName) {
            payload['UserName'] = body.UserName;
        }
        if (body.Password) {
            payload['Password'] = body.Password;
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
        if (body.InvalidPasswordCount) {
            payload['InvalidPasswordCount'] = body.InvalidPasswordCount;
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

        //!Tab2
        if (body.Title) {
            payload['Title'] = body.Title;
        }
        if (body.FirstName) {
            payload['FirstName'] = body.FirstName;
        }
        if (body.LastName) {
            payload['LastName'] = body.LastName;
        }
        if (body.AbbreviateName) {
            payload['AbbreviateName'] = body.AbbreviateName;
        }
        if (body.Email) {
            payload['Email'] = body.Email;
        }
        if (body.Telephone) {
            payload['Telephone'] = body.Telephone;
        }
        if (body.CitiZenID) {
            payload['CitiZenID'] = body.CitiZenID;
        }
        if (body.Picture) {
            payload['Picture'] = body.Picture;
        }

        //!Tab3
        if (body.EmpNo) {
            payload['EmpNo'] = body.EmpNo;
        }
        if (body.DeptCode) {
            payload['DeptCode'] = body.DeptCode;
        }
        if (body.EmpNo) {
            payload['CompanyCode'] = body.CompanyCode;
        }
        if (body.EmpNo) {
            payload['OperationCode'] = body.OperationCode;
        }
        if (body.EmpNo) {
            payload['SubOperationCode'] = body.SubOperationCode;
        }
        if (body.CentralRefNo) {
            payload['CentralRefNo'] = body.CentralRefNo;
        }
        if (body.BusinessType) {
            payload['BusinessType'] = body.BusinessType;
        }
        if (body.DocIssueUnit) {
            payload['DocIssueUnit'] = body.DocIssueUnit;
        }
        if (body.LockLocation) {
            payload['LockLocation'] = body.LockLocation;
        }
        if (body.DeptFlag) {
            payload['DeptFlag'] = body.DeptFlag;
        }
        if (body.GrpSubOperation) {
            payload['GrpSubOperation'] = body.GrpSubOperation;
        }
        if (body.GrpOperationCode) {
            payload['GrpOperationCode'] = body.GrpOperationCode;
        }

        //!Tab4
        if (body.DefaultLanguage) {
            payload['DefaultLanguage'] = body.DefaultLanguage;
        }
        if (body.FontFamily) {
            payload['FontFamily'] = body.FontFamily;
        }
        if (body.FontSize) {
            payload['FontSize'] = body.FontSize;
        }
        if (body.DateFormat) {
            payload['DateFormat'] = body.DateFormat;
        }
        if (body.TimeZone) {
            payload['TimeZone'] = body.TimeZone;
        }
        if (body.AmountFormat) {
            payload['AmountFormat'] = body.AmountFormat;
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

export { getUserORAdmin, addUserOrAdmin, deleteUserOrAdmin, updateUserOrAdmin };
