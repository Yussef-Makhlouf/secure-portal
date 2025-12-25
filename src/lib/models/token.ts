import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccessLog {
    timestamp: Date;
    page: string;
    ip: string;
    userAgent?: string;
}

export interface IToken extends Document {
    token: string;
    clientName: string;
    clientEmail?: string;
    allowedPages: string[];
    allowedDomains: string[];
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    accessLog: IAccessLog[];
    accessCount: number;
    lastAccessedAt?: Date;
    notes?: string;
}

const AccessLogSchema = new Schema<IAccessLog>({
    timestamp: { type: Date, default: Date.now },
    page: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String },
});

const TokenSchema = new Schema<IToken>(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        clientName: {
            type: String,
            required: true,
            trim: true,
        },
        clientEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },

        allowedPages: {
            type: [String],
            required: true,
            default: [],
        },
        allowedDomains: {
            type: [String],
            default: [], // Empty means all domains are allowed (backward compatibility)
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        accessLog: {
            type: [AccessLogSchema],
            default: [],
        },
        accessCount: {
            type: Number,
            default: 0,
        },
        lastAccessedAt: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient token validation queries
TokenSchema.index({ token: 1, isActive: 1, expiresAt: 1 });

// Static method to generate secure token
TokenSchema.statics.generateToken = function (): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomValues = new Uint8Array(64);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomValues);
    } else {
        for (let i = 0; i < 64; i++) {
            randomValues[i] = Math.floor(Math.random() * 256);
        }
    }
    for (let i = 0; i < 64; i++) {
        token += chars[randomValues[i] % chars.length];
    }
    return token;
};

// Check if model already exists to prevent recompilation in dev
const Token: Model<IToken> = mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);

export default Token;
