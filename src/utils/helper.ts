import { GraphQLClient } from 'graphql-request';
import Request from 'request-promise-native';
import Config from '../lib/config';
import { Credit, GraphQLRequestOptions, HttpRequestOptions, ProblemDifficulty, ProblemStatus, SubmissionStatus } from './interfaces';


class Helper {

    static credit: Credit;

    static setCredit(credit: Credit): void {
        Helper.credit = credit;
    }

    static parseCookie(cookies: Array<string>, key: string): string {
        for (let ix = 0; ix !== cookies.length; ++ix) {
            const result = cookies[ix].match(new RegExp(`${key}=(.+?);`));
            if (result) {
                return result[1] || "";
            }
        }
        return "";
    }

    static levelToName(level: number): string {
        switch (level) {
            case 1: return 'Easy';
            case 2: return 'Medium';
            case 3: return 'Hard';
            default: return '';
        }
    }

    static statusMap(status: string | null): ProblemStatus {
        switch (status) {
            case "ac": return ProblemStatus["Accept"];
            case "notac": return ProblemStatus["Not Accept"];
            case null: return ProblemStatus["Not Start"];
            default: return ProblemStatus["Not Start"];
        }
    }

    static difficultyMap(difficulty: number): ProblemDifficulty {
        return difficulty;
    }

    static submissionStatusMap(submission: string): SubmissionStatus {
        switch (submission) {
            case "Accepted": return SubmissionStatus["Accepted"];
            case "Compile Error": return SubmissionStatus["Compile Error"];
            case "Time Limit Exceeded": return SubmissionStatus["Time Limit Exceeded"];
            case "Wrong Answer": return SubmissionStatus["Wrong Answer"];

            case "10": return SubmissionStatus["Accepted"];
            case "11": return SubmissionStatus["Wrong Answer"];
            case "14": return SubmissionStatus["Time Limit Exceeded"];
            case "20": return SubmissionStatus["Compile Error"];
            // TODO : find out what this numbers mean
            // 12 => MLE
            // 13 => OLE
            // 15 => RE
            // 16 => IE
            // 21 => UE
            // 30 => TO
            // default => UE
            default: return SubmissionStatus["Wrong Answer"];
        }
    }

    static async HttpRequest(options: HttpRequestOptions): Promise<any> {
        return await Request({
            method: options.method || "GET",
            uri: options.url,
            followRedirect: false,
            headers: {
                Cookie: Helper.credit ? `LEETCODE_SESSION=${Helper.credit.session};csrftoken=${Helper.credit.csrfToken}` : "",
                "X-Requested-With": 'XMLHttpRequest',
                "X-CSRFToken": Helper.credit ? Helper.credit.csrfToken : "",
                Referer: options.referer || Config.uri.base,
            },
            resolveWithFullResponse: options.resolveWithFullResponse || false,
            form: options.form || null,
            body: JSON.stringify(options.body) || "",
        });
    }

    static async GraphQLRequest(options: GraphQLRequestOptions): Promise<any> {
        const client = new GraphQLClient(
            Config.uri.graphql,
            {
                headers: {
                    Origin: options.origin || Config.uri.base,
                    Referer: options.referer || Config.uri.base,
                    Cookie: `LEETCODE_SESSION=${Helper.credit.session};csrftoken=${Helper.credit.csrfToken};`,
                    "X-Requested-With": 'XMLHttpRequest',
                    "X-CSRFToken": Helper.credit.csrfToken,
                }
            }
        );
        return await client.request(
            options.query,
            options.variables || {},
        );
    }
}

export default Helper;
