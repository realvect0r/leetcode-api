import Helper from "../utils/helper";
import { ProblemDifficulty, ProblemStatus, Uris } from "../utils/interfaces";
import Submission from "./submission";

class Problem {

    static uris: Uris;

    static setUris(uris: Uris): void {
        Problem.uris = uris;
    }

    constructor(
        readonly slug: string,
        public id?: number,
        public title?: string,
        public difficulty?: ProblemDifficulty,
        public starred?: boolean,
        public locked?: boolean,
        public likes?: number,
        public dislikes?: number,
        public status?: ProblemStatus,
        public tag?: Array<string>,
        public totalAccepted?: number,
        public totalSubmission?: number,

        public sampleTestCase?: string,
        public content?: string,
        public codeSnippets?: Array<any>,
    ) { }

    async detail(): Promise<Problem> {
        const response = await Helper.GraphQLRequest({
            query: `
                query getQuestionDetail($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                        questionId
                        title
                        difficulty
                        likes
                        dislikes
                        isLiked
                        isPaidOnly
                        stats
                        status
                        content
                        topicTags {
                            name
                        }
                        codeSnippets {
                            lang
                            langSlug
                            code
                        }
                        sampleTestCase
                    }
                }
            `,
            variables: {
                titleSlug: this.slug,
            }
        });
        const question = response.question;
        this.id = Number(question.questionId);
        this.title = question.title;
        this.difficulty = Helper.difficultyMap(question.difficulty);
        this.starred = question.isLiked !== null;
        this.locked = question.isPaidOnly;
        this.likes = question.likes;
        this.dislikes = question.dislikes;
        this.status = Helper.statusMap(question.status);
        this.tag = question.topicTags.map(function (t: any) {
            return t.name;
        });
        const stats: any = JSON.parse(question.stats);
        this.totalAccepted = stats.totalAcceptedRaw;
        this.totalSubmission = stats.totalSubmissionRaw;

        this.sampleTestCase = question.sampleTestCase;
        this.content = question.content;
        this.codeSnippets = question.codeSnippets;
        return this;
    }

    async getSubmissions(): Promise<Array<Submission>> {
        const submissions: Array<Submission> = [];
        let offet = 0;
        const limit = 20;
        let hasNext = true;
        while (hasNext) {
            const response = await Helper.GraphQLRequest({
                query: `
                query Submissions($offset: Int!, $limit: Int!, $questionSlug: String!) {
                    submissionList(offset: $offset, limit: $limit, questionSlug: $questionSlug) {
                        lastKey
                        hasNext
                        submissions {
                            id
                            statusDisplay
                            lang
                            runtime
                            timestamp
                            url
                            isPending
                            memory
                        }
                    }
                }
                `,
                variables: {
                    offset: offet,
                    limit: limit,
                    questionSlug: this.slug,
                }
            });

            hasNext = response.submissionList.hasNext;
            const submission: Array<any> = response.submissionList.submissions;
            offet += submission.length;
            submission.map(s => {
                submissions.push(new Submission(
                    Number(s.id),
                    s.isPending,
                    s.lang,
                    s.memory,
                    s.runtime,
                    Helper.submissionStatusMap(s.statusDisplay),
                    Number(s.timestamp),
                ));
            });
        }
        return submissions;
    }

    async submit(lang: string, code: string): Promise<Submission> {
        const response = await Helper.HttpRequest({
            url: Problem.uris.submit.replace("$slug", this.slug),
            method: "POST",
            body: {
                lang: lang,
                "question_id": this.id,
                "typed_code": code,
            }
        });
        return new Submission(JSON.parse(response).submission_id);
    }
}

export default Problem;
