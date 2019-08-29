import { expect } from 'chai';
import Dotenv from 'dotenv';
import 'mocha';
import Leetcode from '../src';
import Problem from '../src/lib/problem';
import Submission from '../src/lib/submission';
import { EndPoint, ProblemDifficulty, ProblemStatus } from '../src/utils/interfaces';

describe("# Problem", async function () {
    this.enableTimeouts(false);
    const problem: Problem = new Problem("two-sum");
    before(async () => {
        Dotenv.config();
        await Leetcode.build(
            process.env.LEETCODE_USERNAME || "",
            process.env.LEETCODE_PASSWORD || "",
            process.env.LEETCODE_ENDPOINT === "CN" ? EndPoint.CN : EndPoint.US,
        );
        await problem.detail();
    });

    it("Should be instance of Problem", () => {
        expect(problem).to.instanceOf(Problem);
    });

    it("Should contain base field", () => {
        expect(problem.id).to.be.a("number");
        expect(problem.title).to.be.a("string");
        expect(problem.content).to.be.a("string");
        expect(problem.difficulty).to.be.oneOf([
            ProblemDifficulty["Easy"],
            ProblemDifficulty["Medium"],
            ProblemDifficulty["Hard"],
        ]);
        expect(problem.starred).to.be.a("boolean");
        expect(problem.locked).to.be.a("boolean");
        expect(problem.likes).to.be.a("number");
        expect(problem.dislikes).to.be.a("number");
        expect(problem.status).to.be.oneOf([
            ProblemStatus["Accept"],
            ProblemStatus["Not Accept"],
            ProblemStatus["Not Start"],
        ]);
        expect(problem.tag).to.be.an("array");
        expect(problem.totalAccepted).to.be.a("number");
        expect(problem.totalSubmission).to.be.a("number");
        expect(problem.sampleTestCase).to.be.a("string");
        expect(problem.content).to.be.a("string");
        expect(problem.codeSnippets).to.be.an("array");
    });
    it("Could get submissions", async () => {
        const submissions: Array<Submission> = await problem.getSubmissions();
        expect(submissions).to.be.a("array");
    });

    it("Could submit solution", async () => {
        const submission = await problem.submit("cpp", "test code here");
        setTimeout(async () => {
            await submission.detail();
            expect(submission.status).to.be.a("number");
        }, 5000);
    });
});
