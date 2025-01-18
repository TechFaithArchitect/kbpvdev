import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import chuzoSiteResources from "@salesforce/resourceUrl/chuzoSite";
import callEndpoint from "@salesforce/apex/POE_ProvidersApexCallout.callEndpoint";

export default class modal_SendingOrder extends LightningModal {
	@api timeoutMilliseconds;
	@api checkOrderCallout;
	@api isGuestUser;

	retryCount = 0;

	get iconInfoVerifyOrder() {
		return chuzoSiteResources + '/images/icon-send-order.svg';
	}

	get hasRetriesLeft() {
		return true;
		//return this.retryCount < 3;
	}

	connectedCallback(){
		this.delayOrderCallout();
	}

	delayOrderCallout(isRetry = false) {
		setTimeout(() => {
			if (this.checkOrderCallout) {
				this.sendOrderCallout(isRetry);
			} else {
				this.close({
					orderFailed: true
				});
			}
		}, this.timeoutMilliseconds);
	}

	sendOrderCallout(isRetry = false) {
		console.log("Check Submitted Order Request", this.checkOrderCallout);
		let apiResponse;
		const modalResult = {};
		callEndpoint({ inputMap: this.checkOrderCallout })
		.then((response) => {
			apiResponse = response;
			const result = JSON.parse(response);
			console.log("Check Submitted Order Response", result);
			if (result.hasOwnProperty("error")) {
				let errorMessage = `${result.message !== undefined ? result.message + "." : ""} ${
					result.error.hasOwnProperty("provider")
						? result.error.provider.message.hasOwnProperty("message")
							? result.error.provider.message.message
							: result.error.provider.message.hasOwnProperty("errorDescription")
							? result.error.provider.message.errorDescription
							: result.error.provider.message.hasOwnProperty("value")
							? result.error.provider.message.value.content.errors[0].errorText
							: result.error.provider.message
						: result.error.message
				}.`;
				const event = new ShowToastEvent({
					title: "Server Error",
					variant: "error",
					mode: "sticky",
					message: errorMessage
				});
				this.dispatchEvent(event);
				modalResult.orderFailed = true;
				this.logError(
					`${errorMessage}\nAPI Response: ${response}`, 
					this.checkOrderCallout, 
					this.checkOrderCallout.path, 
					"API Error"
				);
			} else {
				switch (result.status.toUpperCase()) {
					case "COMPLETE":
						modalResult.orderInProgress = false;
						modalResult.orderSuccess = true;
						modalResult.noCompleteInfo = false;
						modalResult.getOrdersHandlerInput = result.value.createOrderResponse.data.orderIdentifier.omsOrderId;
						break;
					case "FAILURE":
						console.error(error, "ERROR");
						const genericErrorMessage = "The order could not be confirmed. Please resend the order";
						const event = new ShowToastEvent({
							title: "Error",
							variant: "error",
							mode: "sticky",
							message: genericErrorMessage
						});
						modalResult.orderInProgress = true;
						modalResult.orderFailed = true;
						this.logError(
							`${genericErrorMessage}\nAPI Response: ${response}`,
							this.checkOrderCallout,
							this.checkOrderCallout.path,
							"API Error"
						);
						break;
					case "IN PROGRESS":
						if (this.isGuestUser) {
							this.retryCount += 1;
							this.delayOrderCallout(true);
						} else {
							const warningToastEvent = new ShowToastEvent({
								title: "Transaction In Progress",
								variant: "warning",
								mode: "sticky",
								message: "Transaction is still in progress, please wait 30 seconds and try again."
							});
							this.dispatchEvent(warningToastEvent);
							modalResult.orderFailed = false;
							modalResult.orderInProgress = true;
							break;
						}
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
					this.checkOrderCallout,
					this.checkOrderCallout.path,
					"API Error"
				);
			} else {
				const errorMessage = error.body?.message || error.message;
				this.logError(errorMessage);
			}
			modalResult.orderFailed = true;
		})
		.finally(() => {
			if ((isRetry && !this.hasRetriesLeft) || !isRetry) {
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
            component: "modal_SendingOrder",
            error: errorMessage ? JSON.stringify(errorMessage) : errorMessage
        };

        this.dispatchEvent(
            new CustomEvent("logerror", {
                detail: error
            })
        );
    }
}