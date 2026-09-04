import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { connectDatabase } from './config/database';
import { Role } from './models/Role';

// --- Import Routes --- //
import auth from './routes/auth';
import characters from './routes/characters';
import './models/DiscordUser';
import roles from './routes/roles';
import businesses from './routes/businesses';
import citationParameters from './routes/citationParameters';
import meta from './routes/meta';

dotenv.config();

const requiredEnvVars = [
    'MONGO_URL',
    'SESSION_SECRET',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_CALLBACK_URL',
    'FRONTEND_URL'
];

async function migrateRoles() {
    await Role.updateMany(
        { 'permissions.hasBusinessesAccess': { $exists: false } },
        {
            $set: {
                'permissions.hasBusinessesAccess': false,
                'permissions.canAddBusiness': false,
                'permissions.canEditBusiness': false,
                'permissions.canDeleteBusiness': false,
                'permissions.canAddBusinessReport': false,
                'permissions.canDeleteBusinessReport': false,
                'permissions.canAddBusinessCitation': false,
                'permissions.canDeleteBusinessCitation': false,
                'permissions.canAddBusinessNotes': false,
                'permissions.canEditCitationParameters': false,
            }
        }
    )
}

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// FRONTEND_URL jest wymagane i różne dla każdego środowiska (staging/produkcja),
// dzięki czemu CORS i redirecty nigdy nie "mieszają się" między środowiskami.
const frontendUrl = process.env.FRONTEND_URL!;

app.use(express.json());

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));

app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL!,
        touchAfter: 24 * 3600,
    }),
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj: Express.User, done) => done(null, obj));

passport.use(new DiscordStrategy(
    {
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: process.env.DISCORD_CALLBACK_URL!,
        scope: ['identify', 'guilds'],
    },
    (_accessToken, _refreshToken, profile, done) => done(null, profile)
));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', auth);
app.use('/api/characters', characters);
app.use('/api/roles', roles);
app.use('/api/businesses', businesses);
app.use('/api/citation-parameters', citationParameters);
app.use('/api/meta', meta);


const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();
        await migrateRoles();
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (env: ${process.env.NODE_ENV ?? 'development'}, frontend: ${frontendUrl})`));
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

void startServer();