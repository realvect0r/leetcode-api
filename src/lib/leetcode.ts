import Helper from '../utils/helper';
import { Credit } from '../utils/interfaces';
import Config from './config';
import Problem from './problem';

class Leetcode {

    session?: string;
    csrfToken: string;

    constructor(credit: Credit) {
        this.session = credit.session;
        this.csrfToken = credit.csrfToken;
    }

    get credit(): Credit {
        return {
            session: this.session,
            csrfToken: this.csrfToken,
        };
    }

    static async build(username: string, password: string): Promise<Leetcode> {
        const credit: Credit = await this.login(username, password);
        Helper.setCredit(credit);
        return new Leetcode(credit);
    }

    static async login(username: string, password: string): Promise<Credit> {
        // got login token first
        const response = await Helper.HttpRequest({
            url: Config.uri.login,
            resolveWithFullResponse: true,
        });
        const token: string = Helper.parseCookie(response.headers['set-cookie'], "csrftoken");
        Helper.setCredit({
            csrfToken: token,
        });

        // then login
        const _response = await Helper.HttpRequest({
            method: "POST",
            url: Config.uri.login,
            form: {
                csrfmiddlewaretoken: token,
                login: username,
                password: password,
            },
            resolveWithFullResponse: true,
        });
        const session = Helper.parseCookie(_response.headers['set-cookie'], "LEETCODE_SESSION");
        const csrfToken = Helper.parseCookie(_response.headers['set-cookie'], "csrftoken");
        return {
            session: session,
            csrfToken: csrfToken,
        };
    }

    async getProfile(): Promise<any> {
        const response: any = await Helper.GraphQLRequest({
            query: `
            {
                user {
                    username
                    isCurrentUserPremium
                }
            }
            `
        });
        return response.user;
    }

    async getAllProblems(): Promise<Array<Problem>> {
        let response = await Helper.HttpRequest({
            url: Config.uri.problemsAll,
        });
        response = JSON.parse(response);
        const problems: Array<Problem> = response.stat_status_pairs.map((p: any) => {
            return new Problem(
                p.stat.question__title_slug,
                p.stat.question_id,
                p.stat.question__title,
                Helper.difficultyMap(p.difficulty.level),
                p.is_favor,
                p.paid_only,
                undefined,
                undefined,
                Helper.statusMap(p.status),
                undefined,
                p.stat.total_acs,
                p.stat.total_submitted,
                undefined,
                undefined,
                undefined
            );
        });
        return problems;
    }

    async getProblemsByTag(tag: string): Promise<Array<Problem>> {
        const response = await Helper.GraphQLRequest({
            query: `
                query getTopicTag($slug: String!) {
                    topicTag(slug: $slug) {
                        questions {
                            status
                            questionId
                            title
                            titleSlug
                            stats
                            difficulty
                            isPaidOnly
                            topicTags {
                                slug
                            }
                        }
                    }
                }
            `,
            variables: {
                slug: tag,
            }
        });
        const problems: Array<Problem> = response.topicTag.questions.map((p: any) => {
            const stat: any = JSON.parse(p.stats);
            return new Problem(
                p.titleSlug,
                p.questionId,
                p.title,
                stat.title,
                undefined,
                p.isPaidOnly,
                undefined,
                undefined,
                Helper.statusMap(p.status),
                p.topicTags.map((t: any) => t.slug),
                stat.totalAcceptedRaw,
                stat.totalSubmissionRaw,
                undefined,
                undefined,
                undefined
            );
        });
        return problems;
    }

}

export default Leetcode;
