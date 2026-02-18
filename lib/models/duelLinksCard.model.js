import mongoose, { Schema, models } from "mongoose";

const duelLinksCardSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        race: {
            type: String,
            required: true,
        },
        attribute: {
            type: String,
            required: false,
        },
        level: {
            type: Number,
            required: false,
        },
        archetype: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const DuelLinksCard =
    models.DuelLinksCard || mongoose.model("DuelLinksCard", duelLinksCardSchema);

export default DuelLinksCard;
