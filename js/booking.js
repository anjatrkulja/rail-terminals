class Booking {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.bookingInfo = this.getBookingInfo();
        this.init();
    }

    getBookingInfo() {
        return {
            id: this.urlParams.get("id"),
            departureTerminal: this.urlParams.get("departureTerminal"),
            arrivalTerminal: this.urlParams.get("arrivalTerminal"),
            departureDate: new Date(this.urlParams.get("departureDate")),
            transitTime: this.urlParams.get("transitTime"),
            eta: new Date(this.urlParams.get("eta")),
            containerNumber: this.urlParams.get("containerNumber"),
            containerType: this.urlParams.get("containerType"),
            price: this.urlParams.get("price"),
        };
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}/${year}`;
    }

    formatPrice(price) {
        const numberFormat = new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "USD"
        });
        return numberFormat.format(price);
    }

    init() {
        this.displayBookingInfo();
        this.addEventListeners();
    }

    displayBookingInfo() {
        document.querySelector("#booking-departureTerminal").innerText = this.bookingInfo.departureTerminal;
        document.querySelector("#booking-arrivalTerminal").innerText = this.bookingInfo.arrivalTerminal;
        document.querySelector("#booking-departureDate").innerText = this.formatDate(this.bookingInfo.departureDate);
        document.querySelector("#booking-transitTime").innerText = this.bookingInfo.transitTime;
        document.querySelector("#booking-eta").innerText = this.formatDate(this.bookingInfo.eta);
        document.querySelector("#booking-containerNumber").innerText = this.bookingInfo.containerNumber;
        document.querySelector("#booking-containerType").innerText = this.bookingInfo.containerType;
        document.querySelector("#booking-price").innerText = this.formatPrice(this.bookingInfo.price);
    }

    addEventListeners() {
        const form = document.querySelector("#booking-form");
        const companyName = document.querySelector("#company-name");
        const companyCode = document.querySelector("#company-code");
        const email = document.querySelector("#email");
        const submitBtn = document.querySelector("#submit-booking-btn");

        if (form && companyName && companyCode && email && submitBtn) {
            submitBtn.addEventListener("click", () => this.handleSubmit());
            [companyName, companyCode, email].forEach(field => {
                field.addEventListener("blur", () => this.validateField(field));
            });
        } else {
            console.error("Form elements not found:", { form, companyName, companyCode, email, submitBtn });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let errorMessage = "";

        switch (field.id) {
            case "company-name":
                errorMessage = value === "" ? "Company name is required." : "";
                break;
            case "company-code":
                errorMessage = !/^[A-Z]{2}\d{4}$/.test(value) ? "Please enter a valid company code." : "";
                break;
            case "email":
                errorMessage = !/^[\w.-]+@[\w.-]+\.\w{2,3}$/.test(value) ? "Please enter a valid email address." : "";
                break;
        }

        if (errorMessage) {
            this.addErrorClass(field);
        } else {
            this.removeErrorClass(field);
        }
        this.displayErrors(`${field.id}-error`, errorMessage);
        return errorMessage;
    }

    validateForm() {
        ["company-name", "company-code", "email"].forEach(id => {
            this.displayErrors(`${id}-error`, "");
        });

        const errors = [];

        ["company-name", "company-code", "email"].forEach(id => {
            const field = document.querySelector(`#${id}`);
            if (field) {
                const error = this.validateField(field);
                if (error) errors.push(error);
            }
        });

        return errors.length === 0;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log("Form submitted successfully");
        } else {
            console.log("Form has errors");
        }
    }

    addErrorClass(element) {
        element.classList.add("error");
    }

    removeErrorClass(element) {
        element.classList.remove("error");
    }

    displayErrors(inputId, errorMessage) {
        const errorElement = document.querySelector(`#${inputId}`);
        if (errorElement) {
            errorElement.innerText = errorMessage;
        } else {
            console.error(`Error element not found for #${inputId}`);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => new Booking());