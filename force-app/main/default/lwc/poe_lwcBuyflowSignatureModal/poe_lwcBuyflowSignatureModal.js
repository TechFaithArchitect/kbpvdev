import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import isGuest from "@salesforce/user/isGuest";
import saveSBSFile from "@salesforce/apex/ProductTabController.saveSBSFile";
import getSignatureFile from "@salesforce/apex/OrderSuccessTabController.getSignatureFile";

let isDownFlag,
    isDotFlag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;

let x = "#0000A0";
let y = 1.5;

let lastX = 0;
let lastY = 0;
let hue = 0;
let direction = true;

let canvasElement, ctx;
let attachment;
let dataURL, convertedDataURI;

var background = new Image();
export default class poe_lwcSignatureModal extends LightningElement {
    @api recordId;
    @api isEncryptedId;
    @api program;
    @api name;
    @api address;
    @api signatureImageUrl;
    loaderSpinner;
    cvId;
    ongoingTouches = [];
    isDrawing = false;
    isUpdate = false;
    noCompleteInformation = true;

    get isDirecTV() {
        return this.program === 'DIRECTV';
    }

    connectedCallback() {
        if (isGuest) {
            if (this.signatureImageUrl) {
                setTimeout(() => this.loadImage(this.signatureImageUrl), 0);
            } else {
                setTimeout(() => this.handleClearClick(), 0);
            }
            
            return;
        }

        this.loaderSpinner = true;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let dd = String(today.getDate()).padStart(2, "0");
        let mm = String(today.getMonth() + 1).padStart(2, "0");
        let yyyy = today.getFullYear();
        let stringToday = this.isDirecTV ? `${mm}/${dd}/${yyyy}` : `${yyyy}/${mm}/${dd}`;
        let myData = {
            ContextId: this.recordId,
            isEncryptedId: this.isEncryptedId
        };
        
        getSignatureFile({ myData: myData })
            .then((response) => {
                canvasElement = this.template.querySelector("canvas");
                ctx = canvasElement.getContext("2d");        

                this.isUpdate = response.result.hasOwnProperty("Id");
                if (this.isUpdate) {
                    this.cvId = response.result.Id;
                    this.loadImage("/poe/sfc/servlet.shepherd/version/download/" + response.result.Id);
                } else {
                    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    ctx.drawImage(background, 0, 0);
                    this.drawText(
                        "Date: " + stringToday,
                        0,
                        canvasElement.height - 10,
                        11,
                        "verdana"
                    );
                    this.drawText(
                        "Customer: " + this.name,
                        0,
                        canvasElement.height - 20,
                        11,
                        "verdana"
                    );
                    this.drawText(
                        "Address: " + this.address,
                        0,
                        canvasElement.height - 30,
                        11,
                        "verdana"
                    );
                    this.loaderSpinner = false;
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
            });
    }

    loadImage(src) {
        canvasElement = this.template.querySelector("canvas");
        ctx = canvasElement.getContext("2d");  

        const newBack = new Image();
        newBack.src = src;
        newBack.onload = () => {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.drawImage(newBack, 0, 0);
            this.drawText(
                "Date: " + stringToday,
                0,
                canvasElement.height - 10,
                11,
                "verdana"
            );
            this.drawText(
                "Customer: " + this.name,
                0,
                canvasElement.height - 20,
                11,
                "verdana"
            );
            this.drawText(
                "Address: " + this.address,
                0,
                canvasElement.height - 30,
                11,
                "verdana"
            );
            this.loaderSpinner = false;
        };  
    }

    drawText(text, centerX, centerY, fontsize, fontface) {
        canvasElement = this.template.querySelector("canvas");
        ctx = canvasElement.getContext("2d");
        ctx.save();
        ctx.font = fontsize + "px " + fontface;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(text, centerX, centerY);
        ctx.restore();
    }

    renderedCallback() {
        canvasElement = this.template.querySelector("canvas");
        canvasElement.addEventListener("mousemove", this.handleMouseMove.bind(this));
        canvasElement.addEventListener("mousedown", this.handleMouseDown.bind(this));
        canvasElement.addEventListener("mouseup", this.handleMouseUp.bind(this));
        canvasElement.addEventListener("mouseout", this.handleMouseOut.bind(this));
        canvasElement.addEventListener("touchstart", this.handleTouchStart.bind(this));
        canvasElement.addEventListener("touchend", this.handleTouchEnd.bind(this));
        canvasElement.addEventListener("touchmove", this.handleTouchMove.bind(this));
    }

    handleMouseMove(event) {
        this.searchCoordinatesForEvent("move", event);
    }

    handleMouseDown(event) {
        this.searchCoordinatesForEvent("down", event);
    }

    handleMouseUp(event) {
        this.searchCoordinatesForEvent("up", event);
    }

    handleMouseOut(event) {
        this.searchCoordinatesForEvent("out", event);
    }

    draw(e, bool) {
        if (!this.isDrawing) return;
        ctx.fillStyle = x;
        if (bool) {
            ctx.beginPath();
            ctx.strokeStyle = x;
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.closePath();
            ctx.stroke();
            lastX = e.offsetX;
            lastY = e.offsetY;
            hue++;
            if (hue >= 360) {
                hue = 0;
            }
            if (ctx.lineWidth >= 80 || ctx.lineWidth <= 1) {
                direction = !direction;
            }
        } else {
            lastX = e.offsetX;
            lastY = e.offsetY;
            ctx.fillRect(lastX, lastY, y, y);
            ctx.closePath();
        }
    }

    handleTouchStart(e) {
        this.noCompleteInformation = false;
        if (e.target == canvasElement) {
            if (e.cancelable) e.preventDefault();
            const clientRect = canvasElement.getBoundingClientRect();
            e.offsetX = e.touches[0].pageX - clientRect.left;
            e.offsetY = e.touches[0].pageY - clientRect.top;
            this.isDrawing = true;
            this.draw(e, false);
        }
    }

    handleTouchEnd(e) {
        this.noCompleteInformation = false;
        if (e.target == canvasElement) {
            if (e.cancelable) e.preventDefault();
            this.isDrawing = false;
        }
    }

    handleTouchMove(e) {
        this.noCompleteInformation = false;
        if (e.target == canvasElement) {
            if (e.cancelable) e.preventDefault();
            const clientRect = canvasElement.getBoundingClientRect();
            e.offsetX = e.targetTouches[0].pageX - clientRect.left;
            e.offsetY = e.targetTouches[0].pageY - clientRect.top;
            this.draw(e, true);
        }
    }

    handleSaveClick() {
        this.loaderSpinner = true;
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        dataURL = canvasElement.toDataURL("image/png");
        convertedDataURI = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        
        const successToast = new ShowToastEvent({
            title: "Success",
            message: "Signature captured.",
            variant: "success"
        });

        if (isGuest) {
            this.dispatchEvent(successToast);

            const guestSaveEvent = new CustomEvent("guestsave", {
                detail: dataURL
            });
            this.dispatchEvent(guestSaveEvent);
            this.loaderSpinner = false;
            return;
        }

        let myData = {
            ContextId: this.recordId,
            strSignElement: convertedDataURI,
            Update: this.isUpdate,
            Type: "signature",
            cvId: this.cvId,
            isEncryptedId: this.isEncryptedId
        };
        saveSBSFile({ myData: myData })
            .then((response) => {
                this.loaderSpinner = false;
                this.dispatchEvent(successToast);
                const gbEvent = new CustomEvent("save", {
                    detail: ""
                });
                this.dispatchEvent(gbEvent);
            })
            .catch((error) => {
                this.loaderSpinner = false;
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error capturing signature",
                        message: "Please try again.",
                        variant: "error",
                        mode: "sticky"
                    })
                );
            });
    }

    handleClearClick() {
        this.noCompleteInformation = true;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let dd = String(today.getDate()).padStart(2, "0");
        let mm = String(today.getMonth() + 1).padStart(2, "0");
        let yyyy = today.getFullYear();
        let stringToday = this.isDirecTV ? `${mm}/${dd}/${yyyy}` : `${yyyy}/${mm}/${dd}`;
        canvasElement = this.template.querySelector("canvas");
        ctx = canvasElement.getContext("2d");
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(background, 0, 0);
        this.drawText("Date: " + stringToday, 0, canvasElement.height - 10, 11, "verdana");
        this.drawText("Customer: " + this.name, 0, canvasElement.height - 20, 11, "verdana");
        this.drawText("Address: " + this.address, 0, canvasElement.height - 30, 11, "verdana");
    }

    searchCoordinatesForEvent(requestedEvent, event) {
        event.preventDefault();
        if (requestedEvent === "down") {
            this.setupCoordinate(event);
            isDownFlag = true;
            isDotFlag = true;
            if (isDotFlag) {
                this.drawDot();
                isDotFlag = false;
            }
        }
        if (requestedEvent === "up" || requestedEvent === "out") {
            isDownFlag = false;
        }
        if (requestedEvent === "move") {
            if (isDownFlag) {
                this.setupCoordinate(event);
                this.redraw();
            }
        }
    }

    setupCoordinate(eventParam) {
        const clientRect = canvasElement.getBoundingClientRect();
        prevX = currX;
        prevY = currY;
        currX = eventParam.clientX - clientRect.left;
        currY = eventParam.clientY - clientRect.top;
    }

    redraw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = x;
        ctx.lineWidth = y;
        ctx.closePath();
        ctx.stroke();
        this.noCompleteInformation = false;
    }

    drawDot() {
        ctx.beginPath();
        ctx.fillStyle = x;
        ctx.fillRect(currX, currY, y, y);
        ctx.closePath();
        this.noCompleteInformation = false;
    }

    hideModal() {
        const closeModalEvent = new CustomEvent("close", {
            detail: "cancel"
        });
        this.dispatchEvent(closeModalEvent);
    }
}