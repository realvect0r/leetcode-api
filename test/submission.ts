import { expect } from 'chai';
import Dotenv from 'dotenv';
import 'mocha';
import Leetcode from '../src';
import Problem from '../src/lib/problem';
import Submission from '../src/lib/submission';
import { EndPoint, ProblemStatus, SubmissionStatus } from '../src/utils/interfaces';

describe("# Submission", async function () {
    this.enableTimeouts(false);
    let submission: Submission;
    before(async () => {
        Dotenv.config();
        const leetcode: Leetcode = await Leetcode.build(
            process.env.LEETCODE_USERNAME || "",
            process.env.LEETCODE_PASSWORD || "",
            process.env.LEETCODE_ENDPOINT === "CN" ? EndPoint.CN : EndPoint.US,
        );
        const problems: Array<Problem> = await leetcode.getAllProblems();
        const acceptedProblems: Array<Problem> = problems.filter((p: Problem) => {
            return p.status === ProblemStatus.Accept;
        });
        const submissions: Array<Submission> = await acceptedProblems[0].getSubmissions();
        submission = submissions[0];
        await submission.detail();
    });

    it("Should be instance of Submission", () => {
        expect(submission).to.instanceOf(Submission);
    });

    it("Should has base field", () => {
        expect(submission.id).to.be.an("number");
        expect(submission.isPending).to.be.a("string");
        expect(submission.lang).to.be.a("string");
        expect(submission.memory).to.be.a("string");
        expect(submission.runtime).to.be.a("string");
        expect(submission.status).to.be.oneOf([
            SubmissionStatus["Accepted"],
            SubmissionStatus["Compile Error"],
            SubmissionStatus["Time Limit Exceeded"],
            SubmissionStatus["Wrong Answer"],
        ]);
        expect(submission.timestamp).to.be.an("number");
        expect(submission.code).to.be.a("string");
    });
});
