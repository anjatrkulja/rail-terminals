class FormSubmit {
    constructor() {
        this.departureTerminal = document.querySelector("#departure-terminal");
        this.arrivalTerminal = document.querySelector("#arrival-terminal");
        this.cargoReadyDate = document.querySelector("#cargo-ready-date");
        this.cargoPeriod = document.querySelector("#cargo-period");
        this.containerNumber = document.querySelector("#container-num");
        this.containerType = document.querySelector("#container-type");
        this.swapBtn = document.querySelector("#swap-btn");
        this.submitBtn = document.querySelector("#submit-btn");

        this.citiesCn = ["Chongqing", "Chengdu", "Wuhan", "Qingdao", "Xian", "Jinan", "Changsha", "Shijiazhuang"].sort();
        this.citiesEu = ["Warsaw", "Malaszewicze", "Budapest", "Belgrade", "Duisburg", "Prague", "Brno", "Dunajska Streda", "Curtici", "Vorsino"].sort();
        this.periods = ["1 week", "2 weeks", "1 month"];
        this.contTypes = ["20ft", "40ft"];

        this.init();
    }

    init() {
        this.populateDropdown(this.departureTerminal, this.citiesCn, "Select a terminal");
        this.populateDropdown(this.arrivalTerminal, this.citiesEu, "Select a terminal");
        this.populateDropdown(this.cargoPeriod, this.periods, "Select a period");
        this.populateDropdown(this.containerType, this.contTypes, "Select a type");

        this.disablePastDate();
        this.addEventListeners();
    }

    populateDropdown(dropdown, options, defaultOption) {
        dropdown.innerHTML = `<option>${defaultOption}</option>`;
        const fragment = document.createDocumentFragment();
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.textContent = option;
            fragment.appendChild(optionElement);
        });
        dropdown.appendChild(fragment);
    }

    disablePastDate() {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        this.cargoReadyDate.setAttribute("min", today.toISOString().slice(0, 10));
    }

    addEventListeners() {
        this.swapBtn.addEventListener("click", () => this.swapTerminals());
        this.submitBtn.addEventListener("click", (e) => this.handleSubmit(e));
        [this.departureTerminal, this.arrivalTerminal, this.cargoReadyDate, this.cargoPeriod, this.containerNumber, this.containerType].forEach(field => {
            field.addEventListener("blur", () => this.validateField(field));
        });
    }

    swapTerminals() {
        const selectedDeparture = this.departureTerminal.value;
        const selectedArrival = this.arrivalTerminal.value;
        const departureOptions = Array.from(this.departureTerminal.options).map(option => option.value).slice(1);
        const arrivalOptions = Array.from(this.arrivalTerminal.options).map(option => option.value).slice(1);

        this.populateDropdown(this.departureTerminal, arrivalOptions, "Select a terminal");
        this.populateDropdown(this.arrivalTerminal, departureOptions, "Select a terminal");
        this.departureTerminal.value = selectedArrival;
        this.arrivalTerminal.value = selectedDeparture;
    }

    validateField(field) {
        const value = field.value;
        let errorMessage = "";

        switch (field.id) {
            case "departure-terminal":
                errorMessage = value === "Select a terminal" ? "Please select a departure terminal." : "";
                break;
            case "arrival-terminal":
                errorMessage = value === "Select a terminal" ? "Please select an arrival terminal." : "";
                break;
            case "cargo-ready-date":
                errorMessage = value === "" ? "Please fill in the cargo ready date." : "";
                break;
            case "cargo-period":
                errorMessage = value === "Select a period" ? "Please select a period." : "";
                break;
            case "container-num":
                errorMessage = value === "" || isNaN(value) || value < 1 || value > 40 ? "Please enter a valid number of containers between 1 and 40." : "";
                break;
            case "container-type":
                errorMessage = value === "Select a type" ? "Please select a container type." : "";
                break;
        }

        if (errorMessage) {
            this.addErrorClass(field);
        } else {
            this.removeErrorClass(field);
        }
        return errorMessage;
    }

    validateForm() {
        const errors = [];

        [this.departureTerminal, this.arrivalTerminal, this.cargoReadyDate, this.cargoPeriod, this.containerNumber, this.containerType].forEach(field => {
            const error = this.validateField(field);
            if (error) errors.push(error);
        });

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return false;
        }
        return true;
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const queryParams = new URLSearchParams({
                departureTerminal: this.departureTerminal.value,
                arrivalTerminal: this.arrivalTerminal.value,
                cargoReadyDate: this.cargoReadyDate.value,
                cargoPeriod: this.cargoPeriod.value,
                containerNumber: this.containerNumber.value,
                containerType: this.containerType.value
            }).toString();

            window.location.href = `schedule.html?${queryParams}`;
        }
    }

    addErrorClass(element) {
        element.classList.add("error");
    }

    removeErrorClass(element) {
        element.classList.remove("error");
    }
}

document.addEventListener("DOMContentLoaded", () => new FormSubmit());