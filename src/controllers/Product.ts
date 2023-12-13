import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

//!Get Product
const getProduct: RequestHandler = async (req: any, res) => {
    const user = req.user;
    const prisma = new PrismaClient();
    try {
        const Product = await prisma.product.findMany();
        if (Product.length === 0) {
            return res.status(404).json({ Product: 'None Product' });
        }
        return res.json(Product);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!Create Product
const addProduct: RequestHandler = async (req, res) => {
    // สร้าง schema object สำหรับตรวจสอบความถูกต้องของข้อมูลที่รับมา
    const schema = Joi.object({
        CateGoryID: Joi.string().min(1).max(255).required(),
        ProductName: Joi.string().min(1).max(255).required(),
        Description: Joi.string().min(0).max(511),
        Price: Joi.number().min(1).required(),
        Stock: Joi.number().integer().min(1).required(),
        Status: Joi.boolean(),
    });

    // ตัวเลือกสำหรับ schema validation
    const options = {
        abortEarly: false, // รวมข้อผิดพลาดทั้งหมด
        allowUnknown: true, // ไม่สนใจ properties ที่ไม่รู้จัก
        stripUnknown: true, // ลบ properties ที่ไม่รู้จัก
    };

    // ตรวจสอบความถูกต้องของข้อมูลที่รับมา
    const { error } = schema.validate(req.body, options);

    // ถ้ามีข้อมูลไม่ถูกต้อง
    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const body = req.body;
    const prisma = new PrismaClient();

    // ใช้ transaction เพื่อป้องกันการทำรายการไม่สมบูรณ์
    return await prisma.$transaction(async function (tx) {
        // ตรวจสอบว่ามีสินค้าที่มีชื่อหรือรายละเอียดซ้ำกันหรือไม่
        const duplicateProduct = await tx.product.findMany({
            where: {
                OR: [
                    { ProductName: { contains: body.ProductName } },
                    // { CateGoryID: body.CateGoryID },
                ],
            },
        });

        // ถ้ามีสินค้าที่มีข้อมูลซ้ำ
        if (duplicateProduct && duplicateProduct.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'ProductName is duplicate in database.',
                data: {
                    ProductName: body.ProductName,
                    // CateGoryID: body.CateGoryID,
                },
            });
        }

        // Generate salt to hash password
        // const Salt = await bcrypt.genSalt(10);
        // สร้าง payload สำหรับการเพิ่มข้อมูลสินค้า
        const payloadUser = {
            CateGoryID: body.CateGoryID,
            ProductName: body.ProductName,
            Description: body.Description,
            Price: body.Price,
            Stock: body.Stock,
            Status: body.Status,
        };

        // เพิ่มข้อมูลสินค้าในฐานข้อมูล
        const product = await tx.product.create({
            data: payloadUser,
        });
        // ส่ง HTTP response กลับถ้าทำรายการเพิ่มข้อมูลสำเร็จ
        return res.status(201).json(product);
    });
};

//!Update Product
const updateProduct: RequestHandler = async (req, res) => {
    // สร้าง schema object สำหรับตรวจสอบความถูกต้องของข้อมูลที่รับมา
    const schema = Joi.object({
        ProductID: Joi.string().uuid().required(),
    });

    // ตัวเลือกสำหรับ schema validation
    const options = {
        abortEarly: false, // รวมข้อผิดพลาดทั้งหมด
        allowUnknown: true, // ไม่สนใจ properties ที่ไม่รู้จัก
        stripUnknown: true, // ลบ properties ที่ไม่รู้จัก
    };

    // ตรวจสอบความถูกต้องของข้อมูลที่รับมา
    const { error } = schema.validate(req.body, options);

    // ถ้าข้อมูลไม่ถูกต้อง
    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const body = req.body;
    const prisma = new PrismaClient();

    // ใช้ transaction เพื่อป้องกันการทำรายการไม่สมบูรณ์
    return await prisma.$transaction(async function (tx) {
        const payload: any = {};
        // ตรวจสอบว่ามีสินค้าที่ต้องการอัพเดทหรือไม่
        const checkProduct = await tx.product.findFirst({
            where: {
                ProductID: body.ProductID,
            },
        });
        // กรณีถ้าไม่พบสินค้า
        if (!checkProduct) {
            return res.status(422).json({ error: 'Product not found' });
        }
        // กำหนดข้อมูลที่ต้องการอัพเดทใน payload
        if (body.CateGoryID) {
            payload['CateGoryID'] = body.CateGoryID;
        }

        if (body.ProductName) {
            payload['ProductName'] = body.ProductName;
        }
        if (body.Price) {
            payload['Price'] = body.Price;
        }
        if (body.Stock) {
            payload['Stock'] = body.Stock;
        }
        if (body.Status) {
            payload['Status'] = body.Status;
        }
        // ทำการอัพเดทข้อมูลในฐานข้อมูล
        const update = await tx.product.update({
            where: {
                ProductID: body.ProductID,
            },
            data: payload,
        });
        // ส่ง HTTP response กลับถ้าทำรายการอัพเดทสำเร็จ
        return res.json(update);
    });
};

//!Delete Product
const deleteProduct: RequestHandler = async (req, res) => {
    // สร้าง schema object สำหรับตรวจสอบความถูกต้องของข้อมูลที่รับมา (ใน query parameters)
    const schema = Joi.object({
        ProductID: Joi.string().uuid().required(),
    });

    // ตัวเลือกสำหรับ schema validation
    const options = {
        abortEarly: false, // รวมข้อผิดพลาดทั้งหมด
        allowUnknown: true, // ไม่สนใจ properties ที่ไม่รู้จัก
        stripUnknown: true, // ลบ properties ที่ไม่รู้จัก
    };

    // ตรวจสอบความถูกต้องของข้อมูลที่รับมา (query parameters)
    const { error } = schema.validate(req.query, options);

    // ถ้าข้อมูลไม่ถูกต้อง
    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const query: any = req.query;
    const prisma = new PrismaClient();

    // ใช้ transaction เพื่อป้องกันการทำรายการไม่สมบูรณ์
    return await prisma.$transaction(async function (tx) {
        // ลบข้อมูลสินค้าจากฐานข้อมูล
        const deleteProduct = await tx.product.delete({
            where: {
                ProductID: query.ProductID,
            },
        });

        // ส่ง HTTP response กลับถ้าทำรายการลบสำเร็จ
        return res.json(deleteProduct);
    });
};

//!Product Join productCategory
const ProductJoinCategory: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const productsWithCategory = await prisma.product.findMany({
            select: {
                ProductID: true,
                ProductName: true,
                Price: true,
                Stock: true,
                Status: true,
                Description: true,
                category: {
                    select: {
                        CategoryID: true,
                        CategoryName: true,
                        Description: true,
                    },
                },
            },
        });

        if (productsWithCategory.length === 0) {
            return res.status(404).json({ Product: 'None Product Join productCategory' });
        }

        return res.json(productsWithCategory);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!Product Join productCategory And By Id
const ProductJoinByID: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { CategoryIDInput } = req.params;
        const productsWithCategory = await prisma.product.findMany({
            where: {
                // ProductID : ProductIDInput,
                category: {
                    CategoryID: CategoryIDInput,
                },
            },
            select: {
                ProductID: true,
                ProductName: true,
                Price: true,
                Stock: true,
                Status: true,
                Description: true,
                category: {
                    select: {
                        CategoryID: true,
                        CategoryName: true,
                        Description: true,
                    },
                },
            },
        });

        if (productsWithCategory.length === 0) {
            return res.status(404).json({ error: 'None Product Join productCategory' });
        }

        return res.json(productsWithCategory);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!search product Name
const searchProductName: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { ProductName } = req.params;
        const productByproductname = await prisma.product.findMany({
            where: {
                ProductName: ProductName,
            },
        });

        if (!productByproductname) {
            return res.status(404).json({ error: 'product By product name not found' });
        }

        return res.json(productByproductname);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!get ข้อมูล Product Category ว่าแต่ละ Price ของ Category มียอดขายเป็นเจ้านวนกีบาท
const getSumPriceCategory: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const userCountry = await prisma.product.groupBy({
            by: ['CateGoryID'],
            _sum: {
                Price: true,
            },
            _count: {
                ProductID: true,
            },
        });

        if (!userCountry.length) {
            return res.status(404).json({ error: 'Category not found' });
        }

        return res.json(userCountry);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!get ข้อมูล Product Category ว่าในเดือนนั้นๆมียอดขายเป็นจำนวนกี่ชิ้น/กี่บาท รับค่าเป็น month (เลข/ตัวหนังสือก็ได้)
// ฟังก์ชันเพื่อแปลงชื่อเดือนเป็นตัวเลข
function getMonthNumber(monthName: string): number | null {
    const months: { [key: string]: number } = {
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12,
    };

    const normalizedMonth = monthName.toLowerCase();
    return months[normalizedMonth] || null;
}

const getSumPriceMonth: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();

    const { Month } = req.params;
    try {
        // ตรวจสอบว่า Month เป็นเลข 1-12 หรือไม่
        const isNumericMonth = /^[1-9]|1[0-2]$/.test(Month);

        // ถ้า Month เป็นเลข 1-12 ให้ใช้เลขนั้นเป็นตัวเลขเดือน
        const monthNumber = isNumericMonth ? parseInt(Month, 10) : getMonthNumber(Month);

        // แปลงค่า Month เป็นช่วงวันที่ครอบคลุมเดือนนั้น
        const startDate = dayjs(`${new Date().getFullYear()}-${monthNumber}`).startOf('month').toDate();
        const endDate = dayjs(`${new Date().getFullYear()}-${monthNumber}`).endOf('month').toDate();

        // คำสั่ง Prisma ในการหายอดรวมราคาของสินค้าตาม Category ในช่วงเวลานั้น
        const CategorySum = await prisma.product.groupBy({
            where: {
                CreatedAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            by: ['CateGoryID', 'CreatedAt'],
            _sum: {
                Price: true,
            },
            _count: {
                ProductID: true,
            },
        });

        if (!CategorySum.length) {
            return res.status(404).json({ error: 'CategorySum not found' });
        }

        return res.json(CategorySum);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

export {
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    ProductJoinCategory,
    ProductJoinByID,
    searchProductName,
    getSumPriceCategory,
    getSumPriceMonth,
};
