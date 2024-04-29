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


	const invitationTemplate = `
	<!DOCTYPE html>
	<html lang="en">
	
	<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Email Template</title>
			<style>
					/* Utility Classes */
					.text-blue-600 {
							color: #3b82f6;
					}
	
					.hover\:underline:hover {
							text-decoration: underline;
					}
	
					.dark\:text-gray-200 {
							color: #9ca3af;
					}
	
					.dark\:text-gray-300 {
							color: #d1d5db;
					}
	
					.dark\:bg-gray-900 {
							background-color: #111827;
					}
	
					.dark\:bg-blue-400 {
							background-color: #60a5fa;
					}
	
					.dark\:text-blue-400 {
							color: #93c5fd;
					}
	
					.dark\:text-blue-600 {
							color: #3b82f6;
					}
	
					/* Custom Classes */
					.container {
							max-width: 42rem; /* Equivalent to max-w-2xl */
							padding: 1.5rem; /* Equivalent to px-6 py-8 */
							margin-left: auto;
							margin-right: auto;
							background-color: #fff; /* Equivalent to bg-white */
					}
	
					.header {
							text-align: center;
					}
	
					.header a {
							width: auto;
							height: 1.75rem; /* Equivalent to h-7 sm:h-8 */
					}
	
					.main {
							margin-top: 2rem; /* Equivalent to mt-8 */
					}
	
					.main h2 {
							color: #4b5563; /* Equivalent to text-gray-700 */
					}
	
					.main p {
							margin-top: 0.5rem; /* Equivalent to mt-2 */
							line-height: 1.625; /* Equivalent to leading-loose */
							color: #4b5563; /* Equivalent to text-gray-600 */
					}
	
					.main p span {
							font-weight: 600; /* Equivalent to font-semibold */
					}
	
					.main a {
							padding: 0.5rem 1.5rem;
							margin-top: 1rem; 
							font-size: 0.875rem;
							font-weight: 500;
							letter-spacing: 0.05em;
							text-transform: capitalize;
							transition-property: background-color, color, border-color;
							transition-duration: 0.3s;
							border-radius: 0.375rem;
							background-color: #3b82f6;
							color: #fff;
							border: none;
							cursor: pointer;
							outline: none;
					}
	
					.main a:hover {
							background-color: #2563eb; /* Equivalent to hover:bg-blue-500 */
					}
	
					.main a:focus {
							box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* Equivalent to focus:ring */
					}
	
					.footer {
							margin-top: 2rem; /* Equivalent to mt-8 */
							color: #6b7280; /* Equivalent to text-gray-500 */
					}
	
					.footer a {
							color: #3b82f6; /* Equivalent to text-blue-600 */
					}
	
					.footer a:hover {
							text-decoration: underline; /* Equivalent to hover:underline */
					}
	
					.footer .copy {
							margin-top: 0.375rem; /* Equivalent to mt-3 */
					}
	
					.copy {
							color: #6b7280; /* Equivalent to text-gray-500 */
					}
			</style>
	</head>

	<body style="background-color: #fff; font-family: Arial, sans-serif;">
    <section style="max-width: 42rem; padding: 1.5rem; margin: 0 auto; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 0.5rem;">
        <header style="text-align: center;">
						<a style="color: #4b5563; text-decoration: none; font-size: 20px;" target="_blank" href="http://localhost:5173/">
							Learn Online
					</a>
        </header>

        <main style="margin-top: 2rem;">
            <h2 style="color: #4b5563;">Hi ${user.username},</h2>

            <p style="margin-top: 0.5rem; line-height: 1.625; color: #4b5563;">
							We are glad to see you on our platform.
							Let's verify your account for  <span class="font-semibold">Learn Online</span> by clicking the button below.
						</p>

            <a href="http://localhost:3003/api/${user.type.toLowerCase()}/verify/${user.id}/${token.id}" style="padding: 0.5rem 1.5rem; margin-top: 1rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.05em; text-transform: capitalize; border: none; border-radius: 0.375rem; background-color: #3b82f6; color: #fff; cursor: pointer; outline: none; transition: background-color 0.3s; text-decoration: none;">Accept the invite</a>

            <p style="margin-top: 2rem; color: #6b7280;">Thanks, <br> Learn Online team</p>
        </main>

        <footer style="margin-top: 2rem; color: #6b7280;">
            <p>
                This email was sent to <a href="#" target="_blank" style="color: #3b82f6; text-decoration: none;">${user.email}</a>. 
            </p>

            <p style="margin-top: 0.375rem;">© <script>document.write(new Date().getFullYear())</script> Learn Online. All Rights Reserved.</p>
        </footer>
    </section>
	</body>
	
</html>`;

	let message: SendMailOptions = {
		from: 'LanguageLearning',
		to: user.email,
		subject: "Account verification",
		text: "Verify your account by clicking to the link",
		html: invitationTemplate
	}

	// `<p>Verify by clicking to</p> <a href="http://localhost:3003/api/${user.type.toLowerCase()}/verify/${user.id}/${token.id}">Sign up</a>`

	const info = await transporter.sendMail(message);
	console.log(info);
}