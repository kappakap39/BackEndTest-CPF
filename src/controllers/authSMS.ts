import { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import Joi, { date } from 'joi';
import nodemailer from 'nodemailer';
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();
const expirationTime = process.env.EXPIRATION_TIME;

//! sentSms
// const sentSms: RequestHandler = async (req, res) => {

//     const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
//     const token = req.headers.authorization?.split(' ')[1];
//     console.log("Token ", token);
//     if (!token) {
//         return res.status(403).json({ error: 'Token not found' });
//     }
//     // ให้ถือว่า Token ถูกต้องเพื่อให้ได้ decodedToken
//     const decodedToken = jwt.verify(token, SECRET_KEY) as { UserID: string };
//     console.log("decodedToken: ", decodedToken);
//     // create schema object
//     const schema = Joi.object({
//         IDUserOrAdmin: Joi.string(),
//         SmsID: Joi.string(),
//         Sender: Joi.string(),
//         Tel: Joi.string(),
//         Result: Joi.string(),
//         Contact: Joi.string(),
//         ScheduleDate: Joi.date(),
//         Option: Joi.string(),
//         Description: Joi.string(),
//         Message: Joi.string(),
//     });
//     const options = {
//         abortEarly: false, // include all errors
//         allowUnknown: true, // ignore unknown props
//         stripUnknown: true, // remove unknown props
//     };
//     const { error } = schema.validate(req.body, options);

//     if (error) {
//         return res.status(422).json({
//             status: 422,
//             message: 'Unprocessable Entity',
//             data: error.details,
//         });
//     }
//     const body = req.body;

//     return await prisma.$transaction(async function (tx) {
//         const payload: any = {
//             IDUserOrAdmin: decodedToken.UserID,
//             Sender: body.Sender,
//             Tel: body.Tel,
//             Result: body.Result,
//             Contact: body.Contact,
//             ScheduleDate: body.ScheduleDate,
//             Option: body.Option,
//             Description: body.Description,
//         };
//         const Management = await tx.smsManagement.create({
//             data: payload,
//         });

//         const payloadMessage: any = {
//             SmsID: Management.SmsID,
//             Message: body.Message,
//         };
//         const Message = await tx.smsManagement.create({
//             data: payloadMessage,
//         });

//         return res.status(201).json({ Management, Message });
//     });
// };

const sentSms: RequestHandler = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token ', token);
    if (!token) {
        return res.status(403).json({ error: 'Token not found' });
    }
    // ให้ถือว่า Token ถูกต้องเพื่อให้ได้ decodedToken
    const decodedToken = jwt.verify(token, SECRET_KEY) as { UserID: string };
    if (!decodedToken.UserID) {
        return res.status(403).json({ error: 'decodedToken not found' });
    }
    console.log('decodedToken: ', decodedToken);
    // create schema object
    const schema = Joi.object({
        IDUserOrAdmin: Joi.string(),
        SmsID: Joi.string(),
        Sender: Joi.string(),
        Tel: Joi.string(),
        Result: Joi.string(),
        Contact: Joi.string(),
        ScheduleDate: Joi.date(),
        Option: Joi.string(),
        Description: Joi.string(),
        Message: Joi.string(),
    });
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
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

    return await prisma.$transaction(async function (tx) {
        const payload: any = {
            IDUserOrAdmin: decodedToken.UserID,
            Sender: body.Sender,
            Tel: body.Tel,
            Result: body.Result,
            Contact: body.Contact,
            ScheduleDate: body.ScheduleDate,
            Option: body.Option,
            Description: body.Description,
        };
        const Management = await tx.smsManagement.create({
            data: payload,
        });

        const splitRow = body.Message.match(/.{1,5}/g); // ตัดข้อความเป็นชุดตามรูปแบบที่กำหนด
        // const rejoinedText = splitRow ? splitRow.join('') : ''; // นำชุดของตัวอักษรกลับมาต่อกันเหมือนเดิม
        // const numberOfChunks = splitRow ? splitRow.length : 0; // จำนวนของชุดของตัวอักษร
        // const totalLength = rejoinedText.length; // ความยาวของข้อความที่นำชุดของตัวอักษรกลับมาต่อกันได้

        // วนลูปเพื่อสร้างและบันทึกข้อความที่ถูกตัดแล้วในฐานข้อมูล
        for (let i = 0; i < splitRow.length; i++) {
            const payloadMessage: any = {
                SmsID: Management.SmsID,
                Message: splitRow[i], // ใช้ชุดข้อความที่ถูกตัดแล้วในแต่ละรอบของลูป
            };
            await tx.smsMessage.create({
                data: payloadMessage,
            });
        }

        // ส่งข้อมูลกลับไปยังผู้ใช้พร้อมกับข้อความแจ้งผลการทำงาน
        return res.status(201).json({ Management, Message: 'Messages created successfully' });
    });
};

export { sentSms };
