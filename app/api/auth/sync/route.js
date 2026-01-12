import dbConnect from "@/lib/db";
import CenterAdminMetadata from "@/lib/models/CenterAdminMetadata";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await dbConnect();
        const { uid, phoneNumber } = await req.json();

        if (!uid || !phoneNumber) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        let user = await CenterAdminMetadata.findOne({ uid });

        if (!user) {
            const username = `fcw-${uid.slice(-10)}`;
            user = await CenterAdminMetadata.create({
                uid,
                username,
                phone_number: phoneNumber,
            });
        } else {
            // Update existing user if needed
            let isUpdated = false;
            // Note: Schema uses phone_number
            if (user.phone_number !== phoneNumber) {
                user.phone_number = phoneNumber;
                isUpdated = true;
            }
            if (!user.username) {
                user.username = `fcw-${uid.slice(-10)}`;
                isUpdated = true;
            }
            if (isUpdated) {
                await user.save();
            }
        }

        return NextResponse.json({ message: "OK", user }, { status: 200 });
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
