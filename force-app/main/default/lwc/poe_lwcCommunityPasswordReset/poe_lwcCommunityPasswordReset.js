import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import setUserPassword from "@salesforce/apex/POE_CommunityPasswordResetController.setUserPassword";

export default class Poe_lwcCommunityPasswordReset extends NavigationMixin(LightningElement) {
    password = "";
    repeatPassword = "";
    message = "";
    conditions =
        "Password must meet the following criteria:\n- At least 8 characters long.\n- Contains at least one letter.\n- Contains at least one digit.\n- Contains at least one of the following special characters: !@#$%^&*().\n- Should not have any other characters besides letters, digits, and the specified special characters.";
    loaderSpinner = false;
    showPasswordFields = true;
    passwordMismatch = true;

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleRepeatPasswordChange(event) {
        this.repeatPassword = event.target.value;
    }

    isValidPassword(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*().])[A-Za-z\d!@#$%^&*().]{8,}$/;
        return regex.test(password);
    }

    resetPassword(password) {
        const encodedPassword = btoa(password);

        setUserPassword({ encodedPassword: encodedPassword })
            .then((result) => {
                this.loaderSpinner = false;
                let response = JSON.parse(result);
                if (response.status === "Success") {
                    this.showPasswordFields = false;
                    this.message = "";
                } else {
                    this.message =
                        "There was an error while trying to reset your password, your password must be different than your previous 3.";
                }
            })
            .catch((error) => {
                this.loaderSpinner = false;
                this.message =
                    "There was an error while trying to reset your password, try again if it keeps happening contact PV Support";
            });
    }

    handlePasswordRepeatValidation() {
        if (this.password && this.repeatPassword) {
            this.passwordMismatch = this.repeatPassword !== this.password ? true : false;
            if (this.passwordMismatch) {
                this.message = "Passwords do not match!";
            } else {
                this.message = "";
            }
        } else this.passwordMismatch = true;
    }

    handleSubmit() {
        this.loaderSpinner = true;
        if (this.passwordMismatch) {
            this.message = "Passwords do not match!";
            this.loaderSpinner = false;
        } else {
            if (!this.isValidPassword(this.password)) {
                this.message = "Your password does not meet the criteria.";
                this.loaderSpinner = false;
                return;
            }

            if (this.password === this.repeatPassword && this.isValidPassword(this.password)) {
                this.resetPassword(this.password);
            }
        }
    }

    redirect() {
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "Home"
            }
        });
    }
}