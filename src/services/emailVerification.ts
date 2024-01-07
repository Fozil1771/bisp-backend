import { Token } from '@prisma/client';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer'


interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	service?: string;
	auth: {
		user: any;
		pass: any;
	};
}

export const emailVerification = async (user: any, token: Token) => {

	let config: EmailConfig = {
		host: "smtp.forwardemail.net",
		port: 465,
		secure: true,
		service: "gmail",
		auth: {
			user: process.env.EMAIL_ADDRESS,
			pass: process.env.EMAIL_PASSWORD
		}
	}

	let transporter: Transporter = nodemailer.createTransport(config);


	let message: SendMailOptions = {
		from: 'LanguageLearning',
		to: user.email,
		subject: "Account verification",
		text: "Verify your account by clicking to the link",
		html: `<p>Verify by clicking to</p> <a href="http://localhost:3003/api/${user.type.toLowerCase()}/verify/${user.id}/${token.id}">Sign up</a>`
	}

	const info = await transporter.sendMail(message);
	console.log(info);
}