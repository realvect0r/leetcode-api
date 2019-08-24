import Helper from "../utils/helper";
import { SubmissionStatus, Uris } from "../utils/interfaces";

class Submission {
    static uris: Uris;

    static setUris(uris: Uris): void {
        Submission.uris = uris;
    }

    constructor(
        public id: number,
        public isPending?: string,
        public lang?: string,
        public memory?: string,
        public runtime?: string,
        public status?: SubmissionStatus,
        public timestamp?: number,
        public code?: string,
    ) { }

    async detail(): Promise<Submission> {
        const response = await Helper.HttpRequest({
            url: Submission.uris.submission.replace("$id", this.id.toString()),
        });
        this.lang = response.match(/getLangDisplay:\s'([^']*)'/)[1];
        this.memory = response.match(/memory:\s'([^']*)'/)[1];
        this.runtime = response.match(/runtime:\s'([^']*)'/)[1];
        this.status = Helper.submissionStatusMap(response.match(/parseInt\('(\d+)', 10/)[1]);
        this.code = JSON.parse(`"${response.match(/submissionCode:\s'([^']*)'/)[1]}"`);
        // TODO : add submit time parse
        // <div id="submitted-time">Submitted: <strong><span id="result_date">33 minutes ago</span></strong></div>
        return this;
    }
}

export default Submission;
