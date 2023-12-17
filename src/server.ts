import express from 'express';
import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import courseRoutes from './routes/courseRoutes';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware for JSON parsing
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/course", courseRoutes);

app.get('/', (req, res) => {
	res.send("Hello world!!!")
})

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
