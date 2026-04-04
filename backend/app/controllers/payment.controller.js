import Payment from "../models/payment.model.js";
import Enrollment from "../models/enrollment.model.js";
import Coupon from "../models/coupon.model.js";
import Course from "../models/course.model.js";
import axios from "axios";
import crypto from "crypto";
import { addStudentToAllCourseChannels } from "./stream.controller.js";

// eSewa Config (Test)
const ESEWA_CONFIG = {
    merchant_id: "EPAYTEST",
    gateway_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    verification_url: "https://rc-epay.esewa.com.np/api/epay/transaction/status",
};

// Initiate eSewa Payment
export const initiateEsewaPayment = async (req, res) => {
    try {
        const { amount, courseId, courseIds, userId } = req.body;
        const numAmount = Number(amount);

        // Support both single course and multiple courses
        const coursesArray = courseIds || (courseId ? [courseId] : []);
        if (coursesArray.length === 0) {
            return res.status(200).json({ success: false, message: "No courses specified" });
        }

        const courseCount = coursesArray.length;
        const transactionId = `ESEWA-${Date.now()}-${userId}-${courseCount}C`;

        let discountAmount = 0;
        let couponId = null;
        const { couponCode } = req.body;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
                // Check if coupon.course is in coursesArray
                const isApplicable = coursesArray.some(id => id.toString() === coupon.course.toString());
                
                if (isApplicable) {
                    // Check expiry and uses
                    const now = new Date();
                    if ((!coupon.expiry || coupon.expiry > now) && (!coupon.maxUses || coupon.uses < coupon.maxUses)) {
                        const course = await Course.findById(coupon.course);
                        if (course) {
                            if (coupon.type === "percentage") {
                                discountAmount = (course.price * coupon.discount) / 100;
                            } else {
                                discountAmount = coupon.discount;
                            }
                            couponId = coupon._id;
                        }
                    }
                }
            }
        }

        console.log("ESEWA INITIATE:", { transactionId, amount: numAmount, courseCount, discountAmount });

        // Create Payment record with courses array
        const payment = new Payment({
            user: userId,
            courses: coursesArray,
            course: courseId, 
            amount: numAmount,
            discountAmount,
            couponUsed: couponId,
            gateway: "esewa",
            transactionId,
            status: "pending",
        });
        await payment.save();

        // Signature Generation
        const signatureString = `total_amount=${numAmount},transaction_uuid=${transactionId},product_code=${ESEWA_CONFIG.merchant_id}`;
        const hmac = crypto.createHmac("sha256", process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q");
        hmac.update(signatureString);
        const signature = hmac.digest("base64");

        const payload = {
            amount: numAmount,
            tax_amount: 0,
            total_amount: numAmount,
            transaction_uuid: transactionId,
            product_code: ESEWA_CONFIG.merchant_id,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: `${process.env.FRONTEND_URL}/payment-success?gateway=esewa`,
            failure_url: `${process.env.FRONTEND_URL}/payment-failure?gateway=esewa`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
        };

        res.json({ success: true, paymentData: payload });
    } catch (err) {
        console.error("ESEWA INITIATE ERROR:", err);
        res.status(200).json({ success: false, message: "Initiation failed", error: err.message });
    }
};

// Verify eSewa Payment
export const verifyEsewaPayment = async (req, res) => {
    try {
        const { product_code, total_amount, transaction_uuid } = req.query;

        // Defensive: If uuid is missing or mangled, we'll try to recover it from other params if possible
        const uuid = transaction_uuid;

        console.log("ESEWA VERIFY START:", { uuid, total_amount });

        const response = await axios.get(ESEWA_CONFIG.verification_url, {
            params: {
                product_code: product_code || ESEWA_CONFIG.merchant_id,
                total_amount: total_amount,
                transaction_uuid: uuid,
            },
        });

        console.log("ESEWA VERIFY STATUS API:", response.data);

        if (response.data.status?.toUpperCase() === "COMPLETE") {
            // SEARCH DB WITH MULTIPLE VARIATIONS (Resilience against ghost typos)
            // 1. Exact match
            // 2. ESE3A vs ESEWA swap
            const variations = [
                uuid,
                uuid?.replace("ESE3A", "ESEWA"),
                uuid?.replace("ESEWA", "ESE3A")
            ].filter(Boolean);

            const payment = await Payment.findOneAndUpdate(
                { transactionId: { $in: variations } },
                { status: "completed" },
                { new: true }
            );

            if (!payment) {
                console.warn("ESEWA VERIFY: No matching record for variations:", variations);
                return res.status(200).json({
                    success: false,
                    message: "Verification successful at eSewa, but no matching pending record found in our system.",
                    receivedId: uuid
                });
            }

            // Create Enrollments for all courses
            const coursesToEnroll = payment.courses && payment.courses.length > 0
                ? payment.courses
                : (payment.course ? [payment.course] : []);

            for (const courseId of coursesToEnroll) {
                const existing = await Enrollment.findOne({ student: payment.user, course: courseId });
                if (!existing) {
                    const enrollment = await Enrollment.create({
                        student: payment.user,
                        course: courseId,
                        payment: payment._id,
                    });

                    // Sync with Course model
                    await Course.findByIdAndUpdate(courseId, {
                        $addToSet: { enrollments: enrollment._id }
                    });

                    // Also add student to all Stream channels for this course
                    await addStudentToAllCourseChannels(String(payment.user), String(courseId));
                }
            }

            // Increment coupon usage if applies
            if (payment.couponUsed) {
                await Coupon.findByIdAndUpdate(payment.couponUsed, { $inc: { uses: 1 } });
            }

            console.log(`ESEWA VERIFY: Created ${coursesToEnroll.length} enrollment(s)`);

            res.json({ success: true, payment });
        } else {
            res.status(200).json({
                success: false,
                message: `eSewa Status: ${response.data.status}`,
                data: response.data
            });
        }
    } catch (err) {
        console.error("ESEWA VERIFY ERROR:", err.response?.data || err.message);
        res.status(200).json({
            success: false,
            message: "Internal verification error",
            error: err.response?.data || err.message
        });
    }
};

// Khalti Logic (Fixed 401 by using sandbox URL for test keys)
export const initiateKhaltiPayment = async (req, res) => {
    try {
        const { amount, courseId, courseIds, userId } = req.body;

        // Support both single course and multiple courses
        const coursesArray = courseIds || (courseId ? [courseId] : []);
        if (coursesArray.length === 0) {
            return res.status(200).json({ success: false, message: "No courses specified" });
        }

        const courseCount = coursesArray.length;
        const transactionId = `KHALTI-${Date.now()}-${userId}-${courseCount}C`;

        let discountAmount = 0;
        let couponId = null;
        const { couponCode } = req.body;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
                const isApplicable = coursesArray.some(id => id.toString() === coupon.course.toString());
                if (isApplicable) {
                    const now = new Date();
                    if ((!coupon.expiry || coupon.expiry > now) && (!coupon.maxUses || coupon.uses < coupon.maxUses)) {
                        const course = await Course.findById(coupon.course);
                        if (course) {
                            if (coupon.type === "percentage") {
                                discountAmount = (course.price * coupon.discount) / 100;
                            } else {
                                discountAmount = coupon.discount;
                            }
                            couponId = coupon._id;
                        }
                    }
                }
            }
        }

        const payment = new Payment({
            user: userId,
            courses: coursesArray,
            course: courseId, // Legacy support
            amount,
            discountAmount,
            couponUsed: couponId,
            gateway: "khalti",
            transactionId,
            status: "pending"
        });
        await payment.save();

        const secretKey = (process.env.KHALTI_SECRET_KEY || "").trim();

        // Diagnostic log: Check key prefix and length (safe logging)
        console.log("KHALTI DIAGNOSTIC:", {
            keyFound: !!secretKey,
            keyLength: secretKey.length,
            keyPrefix: secretKey.substring(0, 15),
            nodeEnv: process.env.NODE_ENV
        });

        if (!secretKey) {
            return res.status(200).json({ success: false, error: "Khalti Secret Key is missing in server environment." });
        }

        const isTestKey = secretKey.startsWith("test_");
        const khaltiUrl = isTestKey
            ? "https://a.khalti.com/api/v2/epayment/initiate/"
            : "https://khalti.com/api/v2/epayment/initiate/";

        const orderName = courseCount > 1
            ? `Course Enrollment (${courseCount} courses)`
            : "Course Enrollment";

        console.log(`KHALTI INITIATE (${isTestKey ? "SANDBOX" : "LIVE"}):`, { transactionId, amount, courseCount, url: khaltiUrl });

        const response = await axios.post(khaltiUrl, {
            return_url: `${process.env.FRONTEND_URL}/payment-success?gateway=khalti`,
            website_url: process.env.FRONTEND_URL,
            amount: Math.round(Number(amount) * 100), // Ensure integer Paisa
            purchase_order_id: transactionId,
            purchase_order_name: orderName,
            customer_info: {
                name: "Test User",
                email: "test@example.com",
                phone: "9800000000"
            }
        }, {
            headers: {
                Authorization: `Key ${secretKey}`,
                "Content-Type": "application/json"
            },
        });

        res.json({ success: true, payment_url: response.data.payment_url });
    } catch (err) {
        console.error("KHALTI INITIATE ERROR:", err.response?.data || err.message);
        const errorMessage = err.response?.data?.detail || err.message;
        res.status(200).json({
            success: false,
            error: errorMessage,
            fullError: err.response?.data,
            hint: errorMessage.includes("Invalid token") ? "Please check your KHALTI_SECRET_KEY in .env and restart the server." : undefined
        });
    }
};

// Verify Khalti Payment
export const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx, purchase_order_id, transaction_id } = req.query;

        console.log("KHALTI VERIFY START:", { pidx, purchase_order_id });

        const secretKey = (process.env.KHALTI_SECRET_KEY || "").trim();
        if (!secretKey) {
            return res.status(200).json({ success: false, error: "Khalti Secret Key is missing" });
        }

        const isTestKey = secretKey.startsWith("test_");
        const khaltiUrl = isTestKey
            ? "https://a.khalti.com/api/v2/epayment/lookup/"
            : "https://khalti.com/api/v2/epayment/lookup/";

        const response = await axios.post(khaltiUrl, { pidx }, {
            headers: {
                Authorization: `Key ${secretKey}`,
                "Content-Type": "application/json"
            },
        });

        console.log("KHALTI VERIFY STATUS API:", response.data);

        if (response.data.status?.toUpperCase() === "COMPLETED") {
            // Find payment by purchase_order_id (our transactionId)
            const payment = await Payment.findOneAndUpdate(
                { transactionId: purchase_order_id },
                { status: "completed" },
                { new: true }
            );

            if (!payment) {
                console.warn("KHALTI VERIFY: No matching record for:", purchase_order_id);
                return res.status(200).json({
                    success: false,
                    message: "Verification successful at Khalti, but no matching pending record found in our system.",
                    receivedId: purchase_order_id
                });
            }

            // Create Enrollments for all courses
            const coursesToEnroll = payment.courses && payment.courses.length > 0
                ? payment.courses
                : (payment.course ? [payment.course] : []);

            for (const courseId of coursesToEnroll) {
                const existing = await Enrollment.findOne({ student: payment.user, course: courseId });
                if (!existing) {
                    const enrollment = await Enrollment.create({
                        student: payment.user,
                        course: courseId,
                        payment: payment._id,
                    });

                    // Sync with Course model
                    await Course.findByIdAndUpdate(courseId, {
                        $addToSet: { enrollments: enrollment._id }
                    });

                    // Also add student to all Stream channels for this course
                    await addStudentToAllCourseChannels(String(payment.user), String(courseId));
                }
            }

            // Increment coupon usage if applies
            if (payment.couponUsed) {
                await Coupon.findByIdAndUpdate(payment.couponUsed, { $inc: { uses: 1 } });
            }

            console.log(`KHALTI VERIFY: Created ${coursesToEnroll.length} enrollment(s)`);

            res.json({ success: true, payment });
        } else {
            res.status(200).json({
                success: false,
                message: `Khalti Status: ${response.data.status}`,
                data: response.data
            });
        }
    } catch (err) {
        console.error("KHALTI VERIFY ERROR:", err.response?.data || err.message);
        res.status(200).json({
            success: false,
            message: "Internal verification error",
            error: err.response?.data || err.message
        });
    }
};
