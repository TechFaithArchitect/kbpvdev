import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";
import dtvCreditCardDeclinedMessage from "@salesforce/label/c.DTV_Credit_Card_Declined_Error_Message";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Poe_lwcSelfServiceDirecTvStreamSendOrderModal extends LightningModal {
	@api timeoutMilliseconds;
	@api checkOrderCallout;
	@api isGuestUser;

	get iconInfoVerifyOrder() {
		return chuzoSiteResources + '/images/icon-send-order.svg';
	}

	connectedCallback(){
		this.delayOrderCallout();
	}

	delayOrderCallout() {
		setTimeout(() => {
			if (this.checkOrderCallout) {
				this.sendOrderCallout();
			} else {
				this.close({
					orderFailed: true
				});
			}
		}, this.timeoutMilliseconds);
	}

	sendOrderCallout() {
		console.log("Check Submitted Order Request", this.checkOrderCallout);
		let apiResponse;
		const modalResult = {};
        let isRetry = false;
		callEndpoint({ inputMap: checkOrderCallout })
        .then((response) => {
            apiResponse = response;
            // hardcoding response for PER-3267 - This should be removed before moving to PROD
            const result = JSON.parse(response);
            // const result = JSON.parse(modalResult.harcodedResponsePER3267);

            console.log("Check Submitted Order Response", result);
            if (result.hasOwnProperty("error")) {
                let isCompleteError = false;
                const handleCompleteError = () => {
                    isCompleteError = result.error.provider.message.status.toUpperCase() === "COMPLETE";

                    return result.error.provider.message.value.content.response.submitorder.errors[0].details[0]
                        .errorMessage[0].details[0].message;
                };

                const errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
                    result.error.hasOwnProperty("provider")
                        ? result.error.provider.message.hasOwnProperty("message")
                            ? result.error.provider.message.message
                            : result.error.provider.message.hasOwnProperty("errorDescription")
                            ? result.error.provider.message.errorDescription
                            : result.error.provider.message.value?.content?.errors?.length > 0
                            ? result.error.provider.message.value.content.errors[0].errorText
                            : result.error.provider.message.value?.content?.response?.submitorder?.errors?.length >
                                0
                            ? handleCompleteError()
                            : result.error.provider.message
                        : result.error.message
                }`;

                const event = new ShowToastEvent({
                    title: "Server Error",
                    variant: "error",
                    mode: "sticky",
                    message: errorMessage
                });
                if (isCompleteError) {
                    event.title = "Error";
                    event.message = "The order could not be confirmed. Please resend the order";
                    modalResult.orderInProgress = false;
                }

                this.dispatchEvent(event);
            } else {
                const genericErrorMessage = "The order could not be confirmed. Please resend the order";
                switch (result.status.toUpperCase()) {
                    case "COMPLETE":
                        if (
                            result.value.content.response.hasOwnProperty("errors") &&
                            result.value.content.response.errors.hasOwnProperty("error") &&
                            result.value.content.response.errors.error.length > 0
                        ) {
                            let errorMessage = "";
                            if (
                                result.value.content.response.errors.error[0].details.length > 0 &&
                                result.value.content.response.errors.error[0].details[0].errorMessage.length > 0 &&
                                result.value.content.response.errors.error[0].details[0].errorMessage[0]
                                    .errorMessage?.content?.errors.length > 0 &&
                                result.value.content.response.errors.error[0].details[0].errorMessage[0]
                                    .errorMessage.content.errors[0].errorCode === "eV1385_201"
                            ) {
                                errorMessage = dtvCreditCardDeclinedMessage;
                            } else {
                                errorMessage =
                                    result.value.content.response.errors.error[0].message !== " "
                                        ? result.value.content.response.errors.error[0].message
                                        : genericErrorMessage;
                            }

                            const errorEvent = new ShowToastEvent({
                                title: "Order Submission Error",
                                variant: "error",
                                mode: "sticky",
                                message: errorMessage
                            });
                            this.dispatchEvent(errorEvent);
                            modalResult.orderInProgress = false;
                            this.logError(
                                `${errorMessage}\nAPI Response: ${response}`,
                                checkOrderCallout,
                                path,
                                "API Error"
                            );
                        } else {
                            modalResult.orderInProgress = false;
                            modalResult.orderSuccess = true;
                            modalResult.noCompleteInfo = false;
                            modalResult.getOrderResultInfoInput = result.value.content.response.submitorder;
                            //this.getOrderResultInfo(result.value.content.response.submitorder);
                        }
                        break;
                    case "FAILURE":
                        const errorEvent = new ShowToastEvent({
                            title: "Order Submission Error",
                            variant: "error",
                            mode: "sticky",
                            message: genericErrorMessage
                        });
                        this.dispatchEvent(errorEvent);
                        modalResult.orderInProgress = false;
                        this.logError(
                            `${genericErrorMessage}\nAPI Response: ${response}`,
                            checkOrderCallout,
                            path,
                            "API Error"
                        );
                        break;
                    case "IN PROGRESS":
                        if (this.isGuestUser) {
							isRetry = true;
							this.delayOrderCallout(true);
						} else {
                            const warningToastEvent = new ShowToastEvent({
                                title: "Transaction In Progress",
                                variant: "warning",
                                mode: "sticky",
                                message: "Transaction is still in progress, please wait 30 seconds and try again."
                            });
                            this.dispatchEvent(warningToastEvent);
                            modalResult.orderInProgress = true;
                        }
                        break;
                }
            }
        })
        .catch((error) => {
            console.error(error, "ERROR");
            const genericErrorMessage =
                "The request could not be made correctly to the server. Please, validate the information and try again.";
            const event = new ShowToastEvent({
                title: "Server Error",
                variant: "error",
                mode: "sticky",
                message: genericErrorMessage
            });
            this.dispatchEvent(event);
            if (apiResponse) {
                this.logError(
                    `${genericErrorMessage}\nAPI Response: ${apiResponse}`,
                    checkOrderCallout,
                    path,
                    "API Error"
                );
            } else {
                const errorMessage = error.body?.message || error.message;
                this.logError(errorMessage);
            }
        })
		.finally(() => {
			if (!isRetry) {
				this.close(modalResult);
			}
		});
	}

	logError(errorMessage, request, endpoint = "", type = "Internal Error") {
        const error = {
            request: request ? JSON.stringify(request) : request,
            endpoint,
            type,
            tab: "Order Submitted",
            component: "Poe_lwcSelfServiceDirecTvStreamSendOrderModal",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}