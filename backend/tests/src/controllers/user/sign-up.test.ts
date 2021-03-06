import { describe, test } from "@jest/globals";
import { prisma } from "@shared/prisma-original";
import request from "supertest";
import { app } from "@src/app";
import { signUpRoute, signUpReqBody } from "@controllers/user/sign-up";
import { saveUser } from "@root/src/shared/user";

describe("sign-up related tests", () => {
	beforeEach(async () => {
		await prisma.user.deleteMany({});
	});

	app.post("/sign-up", signUpRoute);

	const signUpReqInstance: signUpReqBody = {
		firstname: "Atahan",
		lastname: "Ozbayram",
		email: "atahan_ozbayram@hotmail.com",
		gender: 2,
		password: "Password1!",
		password_confirmation: "Password1!",
		username: "username1!",
		birth_date: "1999-07-20",
	};

	test("sending fully empty request body returns 400 status code.", (done) => {
		request(app)
			.post("/sign-up")
			.send({})
			.then((response) => {
				expect(response.statusCode).toBe(400);
				done();
			})
			.catch((error) => done(error));
	});

	test("sending fully correct request body returns 200 status code.", (done) => {
		request(app)
			.post("/sign-up")
			.send(signUpReqInstance)
			.then((response) => {
				expect(response.statusCode).toBe(200);
				done();
			})
			.catch((error) => done(error));
	});

	test("sending already used email will result in status code of 400.", (done) => {
		// save a user with verified key set to true
		const si = signUpReqInstance;
		saveUser({
			firstname: si.firstname,
			lastname: si.lastname,
			username: si.username + "1",
			birth_date: new Date(si.birth_date),
			password: si.password,
			gender: si.gender,
			email: si.email,
		})
			.then((user1) => {
				// update the user1's verified status to true
				prisma.user
					.update({ where: { uuid: user1.uuid }, data: { verified: true } })
					.then(() => {
						request(app)
							.post("/sign-up")
							.send(si)
							.then((response) => {
								expect(response.statusCode).toBe(400);
								done();
							})
							.catch((error) => done(error));
					})
					.catch((error) => done(error));
			})
			.catch((error) => done(error));
	});

	test("sending already used username will result in status code of 400", (done) => {
		// save a user with verified key set to true
		const si = signUpReqInstance;
		saveUser({
			firstname: si.firstname,
			lastname: si.lastname,
			username: si.username,
			birth_date: new Date(si.birth_date),
			email: "1" + si.email,
			gender: 2,
			password: "Password1!",
		})
			.then((user1) => {
				prisma.user
					.update({ where: { uuid: user1.uuid }, data: { verified: true } })
					.then(() => {
						request(app)
							.post("/sign-up")
							.send(si)
							.then((response) => {
								expect(response.statusCode).toBe(400);
								done();
							})
							.catch((error) => done(error));
					})
					.catch((error) => done(error));
			})
			.catch((error) => done(error));
	});
});
