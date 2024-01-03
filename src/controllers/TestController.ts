import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/db';

//!RPeople
// const getPeople: RequestHandler = async (req, res) => {
//     try {
//         // ใช้ PrismaClient instance ที่ถูกสร้างเอาไว้แล้ว
//         const people = await prisma.people.findMany({
//             select: {
//                 Username: true
//             }
//         });
//         if (people.length === 0) {
//             return res.status(404).json({ people: 'None People' });
//         }
//         return res.json(people);
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

const getPeople: RequestHandler = async (req, res) => {
    try {
        // ใช้ PrismaClient instance ที่ถูกสร้างเอาไว้แล้ว
        const people = await prisma.people.findMany({
            select: {
                PeopleID: true,
                Username: true,
                Email: true,
                Tel: true,
            },
        });

        // แยกชุดข้อมูล Username เป็นชุดใหม่เมื่อ Username เกิน 3 ตัวอักษร
        const modifiedPeople = people.reduce((acc, person) => {
            const splitUsernames = person.Username.match(/.{1,3}/g);
            if (splitUsernames) {
                if (splitUsernames.length > 1) {
                    acc.push(
                        ...splitUsernames.map((username) => ({
                            Username: username,
                            PeopleID: String(person.PeopleID),
                            Email: person.Email,
                            Tel: person.Tel,
                        })),
                    );
                } else {
                    acc.push({
                        PeopleID: String(person.PeopleID),
                        Username: person.Username,
                        Email: person.Email,
                        Tel: person.Tel,
                    });
                }
            }
            return acc;
        }, [] as { Username: string; PeopleID: string; Email: string; Tel: string }[]); // เพิ่ม annotation ให้ TypeScript รู้ว่า acc เป็น array ของ object ที่มี properties Username, PeopleID, Email, และ Tel

        if (modifiedPeople.length === 0) {
            return res.status(404).json({ people: 'None People' });
        }

        return res.json(modifiedPeople);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//! by ID people
const getPeopleID: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { PeopleID } = req.params;
        const user = await prisma.people.findFirst({
            where: {
                PeopleID: PeopleID,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'PeopleID not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!RUser
const getUser: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    const user = await prisma.user.findMany();
    return res.json(user);
};
//!RUser By ID
const getUserByID: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { UserID } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                UserID: UserID,
            },
            //   orderBy: {
            //     UserID: 'desc',
            //   },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!RUser By Gender Male / Female
// const getUserByGender: RequestHandler = async (req, res) => {
//     const prisma = new PrismaClient();
//     try {

//         const { GenderInput } = req.params;
//         const userGender = await prisma.user.findMany({
//           where: {
//             Gender : GenderInput,
//           },
//           orderBy: {
//             UserID: 'asc',
//           },
//         });

//         if (!userGender) {
//       return res.status(404).json({ error: 'Gender not found' });
//     }

//     return res.json(userGender);
//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

//!RUser Group by Country
// const getUserGroupByCountry: RequestHandler = async (req, res) => {
//     const prisma = new PrismaClient();
//     try {
//       const userCountry = await prisma.user.groupBy({
//         by: ["Country", "UserID", "FullName"],
//         orderBy: [
//           {
//             Country: 'asc'
//           },
//           {
//             UserID: 'asc'
//           }
//         ]
//       });

//       if (!userCountry.length) {
//         return res.status(404).json({ error: 'Country not found' });
//       }

//       return res.json(userCountry);
//     } catch (error) {
//       console.error('Error:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//       await prisma.$disconnect();
//     }
//   };

//!CUDPeople
//! add
const addPeople: RequestHandler = async (req, res) => {
    // create schema object
    const schema = Joi.object({
        Username: Joi.string().min(1).max(255).required(),
        Email: Joi.string().min(1).max(255).required(),
        FirstName: Joi.string().min(1).max(255).required(),
        LastName: Joi.string().min(1).max(255).required(),
        Tel: Joi.string().min(1).max(20).required(),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    // validate request body against schema
    const { error } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    // {
    //     "Username": "USER.TEST",
    //     "Email": "USER.TEST@cpe.co.th",
    //     "Password": "User@123456789",
    //     "PrefixName": "1",
    //     "FirstName": "ทดสอบ",
    //     "LastName": "ระบบ",
    //     "FirstNameEng": "Test",
    //     "LastNameEng": "System",
    //     "Tel": "0999999999"
    // }

    const body = req.body;
    const prisma = new PrismaClient();

    return await prisma.$transaction(async function (tx) {
        const duplicateUser = await tx.people.findMany({
            where: {
                OR: [{ Username: { contains: body.Username } }],
            },
        });

        if (duplicateUser && duplicateUser.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'Username or email is duplicate in database.',
                data: {
                    Username: body.Username,
                },
            });
        }

        // Generate salt to hash password
        // const Salt = await bcrypt.genSalt(10);

        const payload = {
            Username: body.Username,
            Email: body.Email,
            FirstName: body.FirstName,
            LastName: body.LastName,
            Tel: body.Tel,
            // Role: body.Role,
            // Remove: body.Remove
        };

        const user = await tx.people.create({
            data: payload,
        });

        return res.status(201).json(user);
    });
};

//! const addPeople: RequestHandler = async (req, res) => {
//     const schema = Joi.object({
//         Username: Joi.string().min(1).max(255).required(),
//         Email: Joi.string().min(1).max(255).required(),
//         FirstName: Joi.string().min(1).max(255).required(),
//         LastName: Joi.string().min(1).max(255).required(),
//         Tel: Joi.string().min(1).max(20).required(),
//     });

//     const options = {
//         abortEarly: false,
//         allowUnknown: true,
//         stripUnknown: true,
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
//     const prisma = new PrismaClient();

//     try {
//         if (body.Username.length > 3) {
//             const splitUsernames = body.Username.match(/.{1,3}/g);
//             if (splitUsernames) {
//                 for (const usernamePart of splitUsernames) {
//                     const duplicateUser = await prisma.people.findFirst({
//                         where: {
//                             OR: [{ Username: { contains: usernamePart } }, { Email: { contains: body.Email } }],
//                         },
//                     });

//                     if (duplicateUser) {
//                         return res.status(422).json({
//                             status: 422,
//                             message: 'Username or email is duplicate in database.',
//                             data: {
//                                 Username: usernamePart,
//                                 Email: body.Email,
//                             },
//                         });
//                     }

//                     await prisma.people.create({
//                         data: {
//                             Username: usernamePart,
//                             Email: body.Email,
//                             FirstName: body.FirstName,
//                             LastName: body.LastName,
//                             Tel: body.Tel,
//                         },
//                     });
//                 }
//                 return res.status(201).json({ message: 'Users added successfully.' });
//             }
//         } else {
//             const duplicateUser = await prisma.people.findFirst({
//                 where: {
//                     OR: [{ Username: { contains: body.Username } }, { Email: { contains: body.Email } }],
//                 },
//             });

//             if (duplicateUser) {
//                 return res.status(422).json({
//                     status: 422,
//                     message: 'Username or email is duplicate in database.',
//                     data: {
//                         Username: body.Username,
//                         Email: body.Email,
//                     },
//                 });
//             }

//             await prisma.people.create({
//                 data: {
//                     Username: body.Username,
//                     Email: body.Email,
//                     FirstName: body.FirstName,
//                     LastName: body.LastName,
//                     Tel: body.Tel,
//                 },
//             });

//             return res.status(201).json({ message: 'User added successfully.' });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

//! update
const updatePeople: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        PeopleID: Joi.string().uuid().required(),
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

        if (body.Username) {
            payload['Username'] = body.Username;
        }

        if (body.Email) {
            payload['Email'] = body.Email;
        }
        if (body.FirstName) {
            payload['FirstName'] = body.FirstName;
        }

        if (body.LastName) {
            payload['LastName'] = body.LastName;
        }

        if (body.Tel) {
            payload['Tel'] = body.Tel;
        }

        const update = await tx.people.update({
            where: {
                PeopleID: body.PeopleID,
            },
            data: payload,
        });

        return res.json(update);
    });
};

//! const updatePeople: RequestHandler = async (req, res) => {
//     const schema = Joi.object({
//         PeopleID: Joi.string().uuid().required(),
//         Username: Joi.string().min(1).max(3).required(), // กำหนดความยาวของ Username ไม่เกิน 3 ตัวอักษร
//         // Email: Joi.string().email().required(),
//         // FirstName: Joi.string().required(),
//         // LastName: Joi.string().required(),
//         // Tel: Joi.string().required(),
//     });

//     const options = {
//         abortEarly: false,
//         allowUnknown: true,
//         stripUnknown: true,
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
//     const prisma = new PrismaClient();

//     try {
//         let updateCount = 0;
//         const splitUsernames = body.Username.match(/.{1,3}/g); // แยก Username เป็นชุดที่มีความยาวไม่เกิน 3 ตัวอักษร

//         if (splitUsernames && splitUsernames.length > 1) {
//             // ถ้ามีการแยกชุด Username
//             for (const username of splitUsernames) {
//                 const update = await prisma.people.update({
//                     where: {
//                         PeopleID: body.PeopleID,
//                     },
//                     data: {
//                         Username: username,
//                         Email: body.Email,
//                         FirstName: body.FirstName,
//                         LastName: body.LastName,
//                         Tel: body.Tel,
//                     },
//                 });
//                 updateCount++;
//             }
//         } else {
//             // ถ้า Username ไม่ต้องการแยกชุด
//             const update = await prisma.people.update({
//                 where: {
//                     PeopleID: body.PeopleID,
//                 },
//                 data: {
//                     Username: body.Username,
//                     Email: body.Email,
//                     FirstName: body.FirstName,
//                     LastName: body.LastName,
//                     Tel: body.Tel,
//                 },
//             });
//             updateCount++;
//         }

//         return res.json({ updatedRecords: updateCount });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

const deletePeople: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        PeopleID: Joi.string().uuid().required(),
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
        const deletePeople = await tx.people.delete({
            where: {
                PeopleID: query.PeopleID,
            },
        });
        return res.json(deletePeople);
    });
};

//! CUDUser
const addUser: RequestHandler = async (req, res) => {
    // create schema object
    const schema = Joi.object({
        Email: Joi.string().min(1).max(255).required(),
        Password: Joi.string().min(1).max(255).required(),
        FirstName: Joi.string().min(1).max(255).required(),
        LastName: Joi.string().min(1).max(255).required(),
        FullName: Joi.string().min(1).max(255).required(),
        Address: Joi.string().min(1).max(255),
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
        const duplicateUser = await tx.user.findMany({
            where: {
                OR: [{ FirstName: { contains: body.FirstName } }, { LastName: { contains: body.LastName } }],
            },
        });

        if (duplicateUser && duplicateUser.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'FirstName or LastName is duplicate in database.',
                data: {
                    FirstName: body.FirstName,
                    LastName: body.LastName,
                },
            });
        }

        // Generate salt to hash password
        // const Salt = await bcrypt.genSalt(10);

        const payloadUser = {
            Email: body.Email,
            Password: body.Password,
            FirstName: body.FirstName,
            LastName: body.LastName,
            FullName: body.FullName,
            Address: body.Address,
            Tel: body.Tel,
            Status: body.Status,
            Remove: body.Remove,
            Active: body.Active,
        };

        const user = await tx.user.create({
            data: payloadUser,
        });

        return res.status(201).json(user);
    });
};

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

        if (body.Gender) {
            payload['Gender'] = body.Gender;
        }

        if (body.FirstName) {
            payload['FirstName'] = body.FirstName;
        }

        if (body.LastName) {
            payload['LastName'] = body.LastName;
        }

        if (body.FullName) {
            payload['FullName'] = body.FullName;
        }

        if (body.Country) {
            payload['Country'] = body.Country;
        }

        if (body.Tel) {
            payload['Tel'] = body.Tel;
        }

        if (body.PostCode) {
            payload['PostCode'] = body.PostCode;
        }

        if (body.Company) {
            payload['Company'] = body.Company;
        }

        if (body.Remove) {
            payload['Remove'] = body.Remove;
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

const RowText: RequestHandler = async (req, res) => {
    const { TextRow } = req.body; // รับข้อความจากผู้ใช้
    const splitRow = TextRow.match(/.{1,5}/g); // ตัดข้อความเป็นชุดตามรูปแบบที่กำหนด
    const rejoinedText = splitRow ? splitRow.join('') : ''; // นำชุดของตัวอักษรกลับมาต่อกันเหมือนเดิม
    const numberOfChunks = splitRow ? splitRow.length : 0; // จำนวนของชุดของตัวอักษร
    const totalLength = rejoinedText.length; // ความยาวของข้อความที่นำชุดของตัวอักษรกลับมาต่อกันได้
    return res.json({ splitRow, rejoinedText, numberOfChunks, totalLength }); //แสดงข้อมูล
};


export {
    getPeople,
    addPeople,
    updatePeople,
    deletePeople,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    getUserByID,
    getPeopleID,
    RowText,
};
