class ScheduleInfo {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.departureTerminal = this.urlParams.get("departureTerminal");
        this.arrivalTerminal = this.urlParams.get("arrivalTerminal");
        this.cargoReadyDate = new Date(this.urlParams.get("cargoReadyDate"));
        this.cargoPeriod = this.urlParams.get("cargoPeriod");
        this.containerNumber = parseInt(this.urlParams.get("containerNumber"), 10);
        this.containerType = this.urlParams.get("containerType");

        this.outputCaption = document.querySelector("#schedule-caption");
        this.bookingTableBody = document.querySelector("#schedule-table-body");

        this.CONTAINER_TYPES_PRICES = {
            '40ft': { min: 7500, max: 12000 },
            '20ft': { min: 4500, max: 8000 }
        };

        this.init();
    }

    init() {
        this.updateCaption();
        this.checkAndUpdateData();
        this.loadData();
        this.addEventListeners();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}/${year}`;
    }

    updateCaption() {
        this.outputCaption.innerText = `The schedules from ${this.departureTerminal} to ${this.arrivalTerminal} after ${this.formatDate(this.cargoReadyDate)} for ${this.cargoPeriod} are as follows:`;
    }

    formatPrice(price) {
        const numberFormat = new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "USD"
        });
        return numberFormat.format(price);
    }

    getTransitTimeRange() {
        if (this.departureTerminal === "Vorsino" || this.arrivalTerminal === "Vorsino") {
            return { min: 15, max: 18 };
        } else {
            return { min: 18, max: 30 };
        }
    }

    generateRandomData() {
        const numOfDates = this.getNumberOfDates();
        const randomData = [];
        const { min, max } = this.CONTAINER_TYPES_PRICES[this.containerType] || { min: 0, max: 0 };
        const { min: transitMin, max: transitMax } = this.getTransitTimeRange();

        const getRandomDates = (count, startDate, periodDays) => {
            const dates = [];
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + periodDays);

            while (dates.length < count) {
                let randomDate = new Date(startDate);
                randomDate.setDate(startDate.getDate() + Math.floor(Math.random() * (periodDays - 3)) + 3);

                if (randomDate <= endDate && !dates.some(date => Math.abs(date - randomDate) < 3 * 24 * 60 * 60 * 1000)) {
                    dates.push(new Date(randomDate));
                }
            }

            return dates;
        };

        let periodDays;
        switch (this.cargoPeriod) {
            case "1 week":
                periodDays = 7;
                break;
            case "2 weeks":
                periodDays = 14;
                break;
            case "1 month":
                periodDays = 30;
                break;
        }

        const startDate = new Date(this.cargoReadyDate);
        startDate.setDate(startDate.getDate() + 1);

        const dates = getRandomDates(numOfDates, startDate, periodDays);

        dates.forEach((departureDate, index) => {
            const transitTime = Math.floor(Math.random() * (transitMax - transitMin + 1)) + transitMin;
            const etaDate = new Date(departureDate);
            etaDate.setDate(departureDate.getDate() + transitTime);

            const price = Math.round((Math.random() * (max - min) + min) / 50) * 50;
            const totalPrice = price * this.containerNumber;

            const space = Math.floor(Math.random() * 40) + 1;

            randomData.push({
                id: index + 1,
                departureDate,
                transitTime,
                eta: etaDate,
                price: totalPrice,
                space
            });
        });

        return randomData.sort((a, b) => a.departureDate - b.departureDate);
    }

    getNumberOfDates() {
        const periods = {
            "1 week": [1, 2],
            "2 weeks": 3,
            "1 month": 6
        };
        const numberOfDates = periods[this.cargoPeriod];
        return Array.isArray(numberOfDates) ? numberOfDates[Math.floor(Math.random() * numberOfDates.length)] : numberOfDates;
    }

    checkAndUpdateData() {
        const currentData = {
            departureTerminal: this.departureTerminal,
            arrivalTerminal: this.arrivalTerminal,
            cargoReadyDate: this.cargoReadyDate.toISOString(),
            cargoPeriod: this.cargoPeriod,
            containerNumber: this.containerNumber,
            containerType: this.containerType
        };

        const storedData = this.getStoredData("urlParams");

        if (!storedData || JSON.stringify(storedData) !== JSON.stringify(currentData)) {
            const randomData = this.generateRandomData();
            this.storeData("scheduleData", randomData);
            this.storeData("urlParams", currentData);
        }
    }

    loadData() {
        const randomData = this.getStoredData("scheduleData");
        if (randomData) {
            randomData.forEach((item, index) => {
                const row = document.createElement("tr");
                const availableSpace = item.space < this.containerNumber ? `${item.space} (not enough space)` : item.space;
                const buttonDisabled = item.space < this.containerNumber ? "disabled" : "";

                row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${this.formatDate(new Date(item.departureDate))}</td>
                <td>${item.transitTime}</td>
                <td>${this.formatDate(new Date(item.eta))}</td>
                <td>${availableSpace}</td>
                <td>${this.formatPrice(item.price)}</td>
                <td><button class="btn btn-danger book-btn" data-id="${item.id}" ${buttonDisabled}>Book</button></td>
           `;
                this.bookingTableBody.appendChild(row);
            });
        }
    }

    addEventListeners() {
        this.bookingTableBody.addEventListener("click", (event) => {
            if (event.target.classList.contains("book-btn")) {
                this.handleBook(event.target);
            }
        });
    }

    handleBook(btn) {
        if (btn.hasAttribute("disabled")) {
            alert("Not enough space available for booking.");
            return;
        }

        const bookingId = parseInt(btn.getAttribute("data-id"), 10);
        const randomData = this.getStoredData("scheduleData");
        const selectedRow = randomData.find(item => item.id === bookingId);

        if(selectedRow) {
            const queryParams = new URLSearchParams({
                id: selectedRow.id,
                departureTerminal: this.departureTerminal,
                arrivalTerminal: this.arrivalTerminal,
                containerNumber: this.containerNumber,
                containerType: this.containerType,
                departureDate: selectedRow.departureDate,
                transitTime: selectedRow.transitTime,
                eta: selectedRow.eta,
                price: selectedRow.price
            });

            window.location.href = `booking.html?${queryParams.toString()}`;
        }
    }

    storeData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    getStoredData(key) {
        return JSON.parse(localStorage.getItem(key));
    }

}

document.addEventListener("DOMContentLoaded", () => new ScheduleInfo());
