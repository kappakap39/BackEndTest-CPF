import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import Joi from 'joi';
import { Token } from '../../../../$RECYCLE.BIN/S-1-5-21-1356744833-2796361643-2745879545-1001/$RA1360Y/.prisma/client/index';
import { UserToken } from '../middleware/authUser';

require('dotenv').config();
const expirationTime = process.env.EXPIRATION_TIME;
// const expirationTime = process.env.EXPIRATION_TIME || 3600000;

// ตรวจสอบ token และบันทึก log เมื่อหมดอายุ
const handleTokenExpiration = async (token: string, userId: string) => {
    const tokenExists = await prisma.token.findFirst({
        where: {
            TokenValue: token,
        },
    });
    if (!tokenExists) {
        return console.log('None Token delete Login');
    }
    if (tokenExists.UserID) {
        // บันทึก LogOut โดยอัตโนมัติ
        await prisma.loggets.create({
            data: {
                UserID: userId,
                TypeLogger: 'LogOut ExpirationTime',
            },
        });
        // หา token แล้วให้ทำการลบ
        await prisma.token.delete({
            where: {
                TokenID: tokenExists.TokenID,
            },
        });
    }
};

//! Add Token
const Login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //!start Add Token
        const { Email, Password } = req.body;

        // ตรวจสอบความถูกต้องของข้อมูลที่รับมา
        const schema = Joi.object({
            Email: Joi.string().email().min(1).max(255).required(),
            Password: Joi.string().min(1).max(255).required(),
        });

        // กำหนดตัวเลือกสำหรับการตรวจสอบข้อมูล
        const optionsError = {
            abortEarly: false, // แสดงทุกข้อผิดพลาด
            allowUnknown: true, // ละเว้น properties ที่ไม่รู้จัก
            stripUnknown: true, // ลบ properties ที่ไม่รู้จัก
        };

        // ทำการตรวจสอบข้อมูล
        const { error } = schema.validate(req.body, optionsError);

        if (error) {
            return res.status(422).json({
                status: 422,
                Message: 'Unprocessable Entity',
                data: error.details,
            });
        }

        // แปลงทุกตัวอักษรใน Email และ Password เป็นตัวพิมเล็ก
        const lowercasedEmail = Email.toLowerCase();
        // const lowercasedPassword = Password.string().toLowerCase();
        // const lowercasedEmail = Email ? Email.toLocaleLowerCase() : '';
        // const lowercasedPassword = Password ? Password.toLocaleLowerCase() : '';

        // ตรวจสอบรูปแบบของ Email โดยใช้ regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(lowercasedEmail)) {
            return res.status(403).json({ error: 'Check: Invalid email format' });
        }

        // ค้นหาข้อมูลผู้ใช้จากฐานข้อมูล
        const user = await prisma.user.findUnique({
            where: {
                Email: lowercasedEmail,
            },
        });

        if (user) {
            // ตรวจสอบความถูกต้องของรหัสผ่านที่ได้จากฐานข้อมูล
            const isPasswordValid = bcrypt.compareSync(Password, user.Password);

            if (isPasswordValid) {
                // รหัสผ่านถูกต้อง
                console.log('User authenticated successfully.');

                //! Check token user and delete token
                if (user.UserID) {
                    // // ตรวจสอบความถูกต้องของรหัสผ่าน
                    // const passwordMatch = await bcrypt.compare(Password, user.Password);

                    // if (!passwordMatch) {
                    //     return res.status(403).json({ error: 'Password incorrect' });
                    // }

                    // // ตรวจสอบว่า Email และ Password ถูกส่งมาหรือไม่
                    // if (!lowercasedEmail || !Password) {
                    //     return res.status(403).json({ error: 'Check: Email or Password not found' });
                    // }
                    const tokenExists = await prisma.token.findFirst({
                        where: {
                            UserID: user.UserID,
                        },
                    });

                    if (!tokenExists) {
                        console.log('None user Add Token');
                        // กำหนดคีย์ลับสำหรับการสร้าง Token
                        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

                        // กำหนดข้อมูลที่จะใส่ใน Token
                        const payloadUser = {
                            UserID: user.UserID,
                        };

                        // กำหนดตัวเลือกในการสร้าง Token
                        // const options = {
                        //     expiresIn: '1h',
                        // };

                        // สร้าง Token
                        const token = jwt.sign(payloadUser, SECRET_KEY, { expiresIn: expirationTime });

                        if (token) {
                            // บันทึก Token ลงในฐานข้อมูล
                            await prisma.token.create({
                                data: {
                                    TokenValue: token,
                                    UserID: user.UserID,
                                    Expiration: new Date(Date.now() + Number(expirationTime)),
                                },
                            });

                            await prisma.loggets.create({
                                data: {
                                    UserID: user.UserID,
                                    TypeLogger: 'LogIn',
                                },
                            });

                            //! ตั้งเวลาในการเรียกฟังก์ชันที่ทำการบันทึก LogOut โดยอัตโนมัติ
                            setTimeout(async () => {
                                await handleTokenExpiration(token, user.UserID); // เรียกใช้ handleTokenExpiration ที่เราเพิ่มมา
                            }, Number(expirationTime));
                        } else {
                            return res.status(402).json({ message: 'None found token' });
                        }

                        // ยืนยัน Token และดึงข้อมูลที่ถอดรหัสได้
                        let decoded = null;
                        try {
                            decoded = jwt.verify(token, SECRET_KEY);
                        } catch (err) {
                            console.log(err);
                        }
                        console.log('decoded:', decoded);
                        // ส่งข้อมูล Token และข้อมูลที่ถอดรหัสได้กลับ
                        return res.status(200).json({ Token: token, Decoded: decoded });
                    }
                    if (tokenExists.UserID) {
                        //! refresh token
                        await prisma.loggets.create({
                            data: {
                                UserID: user.UserID,
                                TypeLogger: 'Refresh ExpirationTime',
                            },
                        });
                        // หา token แล้วให้ทำการลบ
                        await prisma.token.delete({
                            where: {
                                TokenID: tokenExists.TokenID,
                            },
                        });
                        // กำหนดคีย์ลับสำหรับการสร้าง Token
                        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

                        // กำหนดข้อมูลที่จะใส่ใน Token
                        const payloadUser = {
                            UserID: user.UserID,
                        };

                        // กำหนดตัวเลือกในการสร้าง Token
                        // const options = {
                        //     expiresIn: '1h',
                        // };

                        // สร้าง Token
                        const token = jwt.sign(payloadUser, SECRET_KEY, { expiresIn: expirationTime });

                        if (token) {
                            // บันทึก Token ลงในฐานข้อมูล
                            await prisma.token.create({
                                data: {
                                    TokenValue: token,
                                    UserID: user.UserID,
                                    Expiration: new Date(Date.now() + Number(expirationTime)),
                                },
                            });

                            await prisma.loggets.create({
                                data: {
                                    UserID: user.UserID,
                                    TypeLogger: 'LogIn',
                                },
                            });

                            //! ตั้งเวลาในการเรียกฟังก์ชันที่ทำการบันทึก LogOut โดยอัตโนมัติ
                            setTimeout(async () => {
                                await handleTokenExpiration(token, user.UserID); // เรียกใช้ handleTokenExpiration ที่เราเพิ่มมา
                            }, Number(expirationTime));
                        } else {
                            return res.status(402).json({ message: 'None found token' });
                        }

                        // ยืนยัน Token และดึงข้อมูลที่ถอดรหัสได้
                        let decoded = null;
                        try {
                            decoded = jwt.verify(token, SECRET_KEY);
                        } catch (err) {
                            console.log(err);
                        }
                        console.log('decoded:', decoded);
                        // ส่งข้อมูล Token และข้อมูลที่ถอดรหัสได้กลับ
                        return res.status(200).json({ Token: token, Decoded: decoded });
                    }
                }
            } else {
                // รหัสผ่านไม่ถูกต้อง
                return res.status(400).json({ error: 'Invalid password.' });
            }
        } else {
            // ไม่พบผู้ใช้
            return console.log('User not found.');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // ปิดการเชื่อมต่อกับฐานข้อมูล
        await prisma.$disconnect();
    }
};

const verifyToken = (tokenCheck: string, SECRET_KEY: string) => {
    try {
        const decoded = jwt.verify(tokenCheck, SECRET_KEY);
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

//!Delete token
const Logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ error: 'Token not found' });
        }

        // ให้ถือว่า Token ถูกต้องเพื่อให้ได้ decodedToken
        const decodedToken = verifyToken(token, SECRET_KEY) as { UserID: string };

        // ตรวจสอบความถูกต้องของ token ที่ค้นหาได้
        const tokenuser = await prisma.token.findFirst({
            where: {
                TokenValue: token,
            },
        });

        if (!tokenuser) {
            return res.status(403).json({ error: 'Invalid Token' });
        }
        // ตรวจสอบความถูกต้องของ decodedToken
        if (decodedToken && decodedToken.UserID) {
            // ตรวจสอบว่า UserID ตรงกับค่าที่คุณต้องการหรือไม่
            if (decodedToken.UserID === tokenuser.UserID) {
                // หา token แล้วให้ทำการลบ
                await prisma.token.delete({
                    where: {
                        TokenID: tokenuser.TokenID,
                    },
                });

                await prisma.loggets.create({
                    data: {
                        UserID: tokenuser.UserID,
                        TypeLogger: 'LogOut',
                    },
                });

                // รับรองว่า Token ถูกต้องและถูกลบ
                return res.status(200).json({ success: 'Logout successfully', decodedToken });
            } else {
                return res.status(403).json({ error: 'Invalid Token User' });
            }
        } else {
            return res.status(403).json({ error: 'Invalid Token' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// ประกาศ checkHeader ใน Request object ของ Express
declare global {
    namespace Express {
        interface Request {
            checkHeader?: string;
        }
    }
}

//!check token to user
const TokenUser = async (req: Request, res: Response) => {
    try {
        const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
        const token = req.headers.authorization?.split(' ')[1];
        const KeyToken = req.query.UserToToken as string;
        // console.log('UserToToken:', userToToken);

        // ใช้ข้อมูล checkHeader ที่ถูกส่งมาจากไฟล์อื่น
        const checkHeader = req.checkHeader;
        // const checkHeader = req.checkHeader?.split(' ')[1];
        console.log('checkHeader: ', checkHeader);

        if (!token) {
            return res.status(403).json({ error: 'Token not found' });
        }

        if (!KeyToken) {
            return res.status(403).json({ error: 'user To Token not found' });
        }

        const decodedToken = verifyToken(token, SECRET_KEY) as { UserID: string };

        const tokenAD = await prisma.token.findFirst({
            where: {
                TokenValue: token,
            },
        });

        const tokenKey = await prisma.token.findFirst({
            where: {
                TokenValue: KeyToken,
            },
        });

        if (!tokenAD) {
            return res.status(403).json({ error: 'Invalid tokenAD' });
        }
        if (!tokenKey) {
            return res.status(403).json({ error: 'Invalid tokenKey' });
        }

        if (decodedToken && decodedToken.UserID === tokenAD.UserID && tokenKey.UserID) {
            const AD_Token = await prisma.user.findUnique({
                where: {
                    UserID: tokenAD.UserID,
                },
                select: {
                    Email: true,
                    FirstName: true,
                    LastName: true,
                    Tel: true,
                    Address: true,
                },
            });
            const KeyUser = await prisma.user.findUnique({
                where: {
                    UserID: tokenKey.UserID,
                },
                select: {
                    Email: true,
                    FirstName: true,
                    LastName: true,
                    Tel: true,
                    Address: true,
                },
            });

            if (!AD_Token) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (!KeyUser) {
                return res.status(404).json({ error: 'Key User not found' });
            }

            const fullName = `${AD_Token.FirstName} ${AD_Token.LastName}`;
            const fullNameKeyUser = `${KeyUser.FirstName} ${KeyUser.LastName}`;

            return res.status(200).json({
                success: true,
                AD_Token: { FullName: fullName },
                KeyUser: { fullNameKeyUser: fullNameKeyUser },
                tokenAD: tokenAD.Expiration,
                tokenKey: tokenKey.Expiration,
            });
        } else {
            return res.status(403).json({ error: 'Invalid Token User' });
        }
    } catch (error) {
        console.error('TokenUser error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export { Login, Logout, TokenUser };
