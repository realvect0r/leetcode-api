import { expect } from 'chai';
import Dotenv from 'dotenv';
import 'mocha';
import Leetcode from '../src';
import Problem from '../src/lib/problem';
import { EndPoint } from '../src/utils/interfaces';

describe("# Leetcode", () => {
    describe("Correct Account", async function () {
        this.enableTimeouts(false);
        let leetcode: Leetcode;
        before(async () => {
            Dotenv.config();
            leetcode = await Leetcode.build(
                process.env.LEETCODE_USERNAME || "",
                process.env.LEETCODE_PASSWORD || "",
                process.env.LEETCODE_ENDPOINT === "CN" ? EndPoint.CN : EndPoint.US,
            );
        });
        it("Should be intance of Leetcode", () => {
            expect(leetcode).to.instanceOf(Leetcode);
        });
        it("Should has session", () => {
            expect(leetcode.session).to.not.null;
        });
        it("Should has csrf token", () => {
            expect(leetcode.csrfToken).to.not.null;
        });
        it("Could get profile", async () => {
            const profile: any = await leetcode.getProfile();
            expect(profile.username).to.not.null;
        });
        it("Could get all problems", async () => {
            const problems: Array<Problem> = await leetcode.getAllProblems();
            expect(problems.length).least(1000);
            const problem: Problem = problems[Math.floor(Math.random() * problems.length)];
            expect(problem.slug).to.not.null;
        });
        it("Could get problems by tag", async () => {
            const problems: Array<Problem> = await leetcode.getProblemsByTag("array");
            expect(problems.length).least(150);
            const problem: Problem = problems[Math.floor(Math.random() * problems.length)];
            expect(problem.slug).to.not.null;
        });
    });
    describe("Incorrect Account", async function () {
        this.enableTimeouts(false);
        it("Should throw login error", async () => {
            try {
                await Leetcode.build(
                    "a wrong username",
                    "a wrong password",
                    EndPoint.US
                );
            } catch (e) {
                expect(e).to.be.an("Error");
                expect(e.message).to.equal("Login Fail");
            }
        });
    });
});
