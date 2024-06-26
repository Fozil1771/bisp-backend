import express, { Request, Response, NextFunction } from 'express';
import session, { Session } from 'express-session';
import PgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import cors from 'cors'
import morgan from 'morgan';
import path from 'path';
import * as fs from 'fs';
import bodyParser from 'body-parser';

import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import courseRoutes from './routes/courseRoutes';
import { authenticateToken } from './auth';
import { AuthenticatedRequest } from './types';



const app = express();

app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 500000 }));
const PORT = process.env.PORT || 3003;

const pgPool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
const sessionStore = new (PgSession(session))({
	pool: pgPool,
	tableName: 'Session'
});

app.use(cors())

app.use(
	session({
		secret: "super secret key",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 60000 },
		store: sessionStore
	})
);

app.use("/public", express.static('public'));

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" ":user-agent"', { stream: accessLogStream }))

// Middleware for JSON parsing
app.use(express.json());




// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/course", courseRoutes);

interface UserSession extends Session {
	user: any;
	// Add other custom properties as needed
}

app.get('/home', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
	const user = req.user;
	console.log(user);
	res.send(user)
})


// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
