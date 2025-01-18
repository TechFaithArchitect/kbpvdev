import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import posIdMessage from "@salesforce/label/c.Frontier_Buyflow_CreditCheck_Z_Message";

export default class Poe_lwcBuyflowFrontierCreditCheckScorePModal extends LightningElement {
    @api responseData;
    @api quoteId;
    @api accountUuid;
    @api frontierUserId;
    noCompleteInfo = true;
    securityQuestions = [];
    answersParsed = [];
    securityChallengeQuestionsAndAnswers = [];
    loaderSpinner;
    creditScore;
    labels = {
        posId: posIdMessage
    };

    connectedCallback() {
        this.loaderSpinner = true;
        let responseDataParsed = JSON.parse(JSON.stringify(this.responseData));
        this.quoteId = responseDataParsed.quoteId;
        this.accountUuid = responseDataParsed.accountUuid;
        let securityChallengeQuestions = responseDataParsed.fraudPrevention.securityChallengeQuestions;
        if (securityChallengeQuestions.length > 0) {
            securityChallengeQuestions.forEach((question) => {
                if (question.answerChoices.length > 0) {
                    let answersArray = [];
                    let answers = question.answerChoices;
                    answers.forEach((answer) => {
                        let answerChoice = {
                            questionId: question.questionNumber,
                            id: question.questionNumber + "-" + answer.number,
                            number: answer.number,
                            text: answer.text,
                            isChecked: false
                        };
                        answersArray.push(answerChoice);
                        this.answersParsed.push(answerChoice);
                    });

                    let security = {
                        question: question.question,
                        questionNumber: question.questionNumber,
                        answerChoices: answersArray
                    };
                    this.securityQuestions.push(security);
                } else {
                    const event = new ShowToastEvent({
                        title: "Server Error",
                        variant: "error",
                        mode: "sticky",
                        message:
                            errorMessage !== undefined
                                ? errorMessage
                                : "The challenge answers options request could not be made correctly to the server. Please, try again."
                    });
                    this.dispatchEvent(event);
                }
                this.loaderSpinner = false;
            });
        } else {
            this.loaderSpinner = false;
            const event = new ShowToastEvent({
                title: "Server Error",
                variant: "error",
                mode: "sticky",
                message:
                    errorMessage !== undefined
                        ? errorMessage
                        : "The challenge questions request could not be made correctly to the server. Please, try again."
            });
            this.dispatchEvent(event);
        }
    }

    handleChoiceChange(event) {
        let selected;
        let value = event.target.value;

        let substrQuestionId = value.substring(0, value.indexOf("-"));

        let index = this.answersParsed.findIndex((answer) => answer.id === value);
        if (index !== undefined && index !== -1) {
            selected = index;
        }
        if (selected !== undefined) {
            let sel = [];
            this.answersParsed.forEach((answer) => {
                if (answer.id === this.answersParsed[selected].id) {
                    answer.isChecked = true;
                } else {
                    let indexAnsw = answer.id.substring(0, answer.id.indexOf("-"));

                    if (indexAnsw == substrQuestionId) {
                        answer.isChecked = false;
                    }
                }
                sel.push(answer);
            });
            this.answersParsed = [];
            this.answersParsed = [...sel];
        }

        this.disableValidations();
    }

    disableValidations() {
        let amountOfQuestions = 0;
        let countAnswersChecked = 0;

        this.securityQuestions.forEach((question) => {
            amountOfQuestions++;
        });

        this.answersParsed.forEach((answer) => {
            if (answer.isChecked) {
                countAnswersChecked++;
            }
        });

        if (amountOfQuestions == countAnswersChecked) {
            this.noCompleteInfo = false;
        } else {
            this.noCompleteInfo = true;
        }
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleAnswerQuestions() {
        this.loaderSpinner = true;

        let securityQuestionAnswersFromUser = [];
        this.answersParsed.forEach((answer) => {
            if (answer.isChecked == true) {
                let userAnswers = {
                    questionNumber: answer.questionId,
                    answerNumber: answer.number
                };
                securityQuestionAnswersFromUser.push(userAnswers);
            }
        });
        const path = "challengeQuestions";
        let myData = {
            partnerName: "frapi",
            tab: "challengequestions",
            path,
            quoteId: this.quoteId,
            accountUuid: this.accountUuid,
            securityChallengeQuestionsAndAnswers: securityQuestionAnswersFromUser,
            userId: this.frontierUserId
        };
        console.log("Challenge Questions Request", myData);
        let apiResponse;
        callEndpoint({ inputMap: myData }).then((response) => {
            apiResponse = response;
            const responseParsed = JSON.parse(response);
            console.log("Challenge Questions Response", responseParsed);
            let result = responseParsed;
            if (result.hasOwnProperty("error")) {
                this.loaderSpinner = false;
                let errorMessage;
                errorMessage = result.error.hasOwnProperty("provider")
                    ? result.error.provider.message
                    : "The credit check request could not be made correctly to the server. Please, try again.";
                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMessage
                });
                this.dispatchEvent(event);
                this.logError(errorMessage);
            } else {
                let amountRedFlags = result?.redFlags.length;
                let redFlagCount = 0;
                if (result.redFlags.length > 0) {
                    result.redFlags.forEach((flag) => {
                        if (flag.disposition.hasOwnProperty("code") && flag.disposition.code == undefined) {
                            redFlagCount++;
                        }
                    });

                    if (amountRedFlags == redFlagCount) {
                        noRedFlags = true;
                    }
                } else {
                    noRedFlags = true;
                }
                let data = this.responseData;
                if (
                    result.creditScore.rating !== "Z" &&
                    result?.redFlags !== undefined &&
                    result?.redFlags.some((item) => item.reason.code === "03")
                ) {
                    this.loaderSpinner = false;
                    const previousAddressModalEvent = new CustomEvent("previousaddress", {
                        detail: data
                    });
                    this.dispatchEvent(previousAddressModalEvent);
                    this.hideModal();
                } else if (result.creditScore.rating !== "P" && result.creditScore.rating !== "Z") {
                    this.loaderSpinner = false;
                    const closeModalEvent = new CustomEvent("challengequestionsverified", {
                        detail: data
                    });
                    this.dispatchEvent(closeModalEvent);
                    this.hideModal();
                } else {
                    this.loaderSpinner = false;
                    const event = new ShowToastEvent({
                        title: "PosId Verification",
                        variant: "error",
                        mode: "sticky",
                        message: this.labels.posId
                    });
                    this.dispatchEvent(event);
                    this.hideModal();
                }
            }
        });
    }

    logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Credit Check",
            component: "poe_lwcBuyflowFrontierCreditCheckScorePModal",
            error: errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }

    handleLogError(event) {
        event.detail = {
            ...event.detail,
            tab: "Credit Check"
        };
        this.dispatchEvent(event);
    }
}