import { NextResponse } from "next/server";
import DuelLinksCard from "@/lib/models/duelLinksCard.model";
import { connectMongoDB } from "@/connectDB";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight OPTIONS request
export const OPTIONS = async () => {
    return NextResponse.json({}, { headers: corsHeaders });
};

export async function POST(request) {
    try {
        const { id, image, name, desc, type, race, attribute, level, archetype } =
            await request.json();

        // Only validate truly required fields – others are optional
        if (!id || !image || !name || !type || !race || !desc) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 },
            );
        }
        await connectMongoDB();
        const existingCard = await DuelLinksCard.findOne({ id });
        if (existingCard) {
            return NextResponse.json(
                { message: "Card already exists" },
                { status: 400 },
            );
        }
        const newCard = await DuelLinksCard.create({
            id,
            image,
            name,
            desc,
            type,
            race,
            attribute,
            level,
            archetype,
        });
        await newCard.save();
        return NextResponse.json(
            { message: "Card stored successfully", card: newCard },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error storing cards cards", error: error.message },
            { status: 500 },
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const type = searchParams.get("type");
        const race = searchParams.get("race");
        const attribute = searchParams.get("attribute");
        const level = searchParams.get("level");
        const archetype = searchParams.get("archetype");

        await connectMongoDB();

        let filter = {};

        // Search by name (case-insensitive)
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        // Filter by type
        if (type) {
            filter.type = type;
        }

        // Filter by race
        if (race) {
            filter.race = race;
        }

        // Filter by attribute
        if (attribute) {
            filter.attribute = attribute;
        }

        // Filter by level (convert to number)
        if (level) {
            filter.level = parseInt(level);
        }

        // Filter by archetype
        if (archetype) {
            filter.archetype = archetype;
        }

        const cards = await DuelLinksCard.find(filter);

        return NextResponse.json(
            {
                message: "Duel links cards retrieved successfully",
                count: cards.length,
                appliedFilters: filter,
                cards,
            },
            { status: 200, headers: corsHeaders },
        );
    } catch (error) {
        console.error("Error fetching cards:", error);
        return NextResponse.json(
            {
                message: "Error fetching cards",
                error: error.message,
            },
            { status: 500, headers: corsHeaders },
        );
    }
}
