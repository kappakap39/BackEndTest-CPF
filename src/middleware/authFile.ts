import multer from "multer";
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import { ErrorRequestHandler } from 'express';
import config from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import Joi from 'joi';

const checkFile = (req: Request, res: Response, next: NextFunction, cb: any) => {
    // ตรวจสอบการมี Header Authorization ใน Request
    const checkHeader = req.headers.authorization;

    if (!checkHeader) {
        return res.status(403).json({ error: 'Header not found' });
    }

    try {

        next();
    } catch (error) {
        console.error('checkHeader error:', error);
        res.status(500).json({ success: false, error: 'req.headers.authorization Server Error' });
    }
};

export { checkFile };