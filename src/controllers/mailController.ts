import { RequestHandler } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../lib/db';

const SentMail: RequestHandler = async (req, res) => {
    try {
        // เตรียมข้อมูลที่จะส่งในอีเมล
        const {from, to, subject, text, html } = req.body;

        // กำหนดค่าการกำหนดค่าสำหรับ Nodemailer
        const transport = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: '0f64a4a99b6aed',
                pass: '2b0449004b7be8',
            },
        });

        // สร้างข้อมูลอีเมล
        const info = await transport.sendMail({
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        // ส่งตอบกลับว่าสำเร็จ
        return res.status(200).json({ success: true, message: 'Message sent successfully', info });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // ปิดการเชื่อมต่อกับฐานข้อมูล
        await prisma.$disconnect();
    }
};

export { SentMail };
