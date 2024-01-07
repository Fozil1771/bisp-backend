import express, { Request, Response, NextFunction } from 'express';
import session, { Session } from 'express-session';
import PgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import cors from 'cors'


import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import courseRoutes from './routes/courseRoutes';


const app = express();
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

app.get('/home', (req: Request, res: Response) => {
	const user = (req.session as UserSession).user;
	console.log(user);
	res.send(`Hello world!! % ${user?.username}`)


})

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
