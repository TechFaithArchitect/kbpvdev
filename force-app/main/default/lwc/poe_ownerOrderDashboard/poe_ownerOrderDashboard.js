import { LightningElement, wire } from "lwc";
import getOrdersInfo from "@salesforce/apex/poe_ownerOrderDashboardController.getOrdersInfo";
import getFilterValues from "@salesforce/apex/poe_ownerOrderDashboardController.getFilterValues";
import getReports from "@salesforce/apex/poe_ownerOrderDashboardController.getReports";

export default class Poe_ownerOrderDashboard extends LightningElement {
    orderData = [];
    hasOrderData = false;
    orderBarconfig;
    orderPercentBarConfig;
    orderDraftBarConfig;
    oppDoughnutConfig;
    mapChartBackgroundColor = new Map();
    init = true;
    loaderSpinner = false;
    reportsByName;
    showCharts = false;
    showDatePicker = false;
    hasError = false;
    OrdersByRepReport;
    DraftReport;
    programReport;
    showDataError = false;
    programOptions = [
        {
            label: "All",
            value: "All"
        }
    ];
    representativeOptions = [
        {
            label: "All",
            value: "All"
        }
    ];
    dateOptions = [
        {
            label: "All",
            value: "All"
        },
        {
            label: "Custom",
            value: "Custom"
        },
        {
            label: "Today",
            value: "TODAY"
        },
        {
            label: "Yesterday",
            value: "YESTERDAY"
        },
        {
            label: "This Week",
            value: "THIS_WEEK"
        },
        {
            label: "Last Week",
            value: "LAST_WEEK"
        },
        {
            label: "This Month",
            value: "THIS_MONTH"
        },
        {
            label: "Last Month",
            value: "LAST_MONTH"
        },
        {
            label: "This Quarter",
            value: "THIS_QUARTER"
        },
        {
            label: "Last Quarter",
            value: "LAST_QUARTER"
        },
        {
            label: "This Year",
            value: "THIS_YEAR"
        },
        {
            label: "Last Year",
            value: "LAST_YEAR"
        }
    ];

    dateSelected = "All";
    programSelected = "All";
    typeSelected = "All";
    startDate = null;
    endDate = null;

    connectedCallback() {
        this.mapChartBackgroundColor.set("DirecTV", "rgb(196,153,245)");
        this.mapChartBackgroundColor.set("Brinks", "rgb(120,187,243)");
        this.mapChartBackgroundColor.set("Charter/Spectrum", "rgb(159,82,243)");
        this.mapChartBackgroundColor.set("EarthLink", "rgb(46,151,238)");
        this.mapChartBackgroundColor.set("Frontier", "lightgreen");
        this.mapChartBackgroundColor.set("Viasat", "rgb(102,241,245)");
        this.mapChartBackgroundColor.set("Windstream", "rgb(245,178,102)");
        this.mapChartBackgroundColor.set("DIRECTV(ENGA)", "rgb(245,102,132)");
        this.mapChartBackgroundColor.set("Other", "rgb(236,245,102)");
        this.mapChartBackgroundColor.set("Altice", "rgb(219,73,24");

        this.getReportsData();
        this.getOrdersData();
    }

    getReportsData() {
        getReports()
            .then((response) => {
                this.reportsByName = response;
                this.OrdersByRepReport = {
                    Name: "Orders by Rep",
                    Id: this.reportsByName["Orders by Rep"]
                };

                this.DraftReport = {
                    Name: "Draft % by Rep",
                    Id: this.reportsByName["Draft % by Rep"]
                };

                this.programReport = {
                    Name: "Orders by Program",
                    Id: this.reportsByName["Orders by Program"]
                };
            })
            .catch((error) => {
                console.log(error);
            });
    }

    getOrdersData() {
        this.loaderSpinner = true;

        getOrdersInfo({
            programFilter: this.programSelected,
            typeFilter: this.typeSelected,
            dateFilter: this.dateSelected,
            startDate: this.startDate,
            endDate: this.endDate
        })
            .then((data) => {
                console.log(data);

                if (
                    data.ordersByProgram.length > 0 ||
                    data.ordersByRep.len > 0 ||
                    !data.numberChartData.hasOwnProperty("error")
                ) {
                    this.setNumberChartsData(data.numberChartData);
                    this.setBarChartData(data);
                    this.setDoughnutChartData(data.ordersByProgram);

                    if (this.init) {
                        getFilterValues()
                            .then((response) => {
                                console.log(response);
                                let program = response.program;
                                program.forEach((element) => {
                                    let program = {
                                        label:
                                            element === "DirecTV"
                                                ? "DIRECTV"
                                                : element === "Charter/Spectrum"
                                                ? "Spectrum"
                                                : element === "Altice"
                                                ? "Optimum"
                                                : element,
                                        value: element
                                    };
                                    this.programOptions.push(program);
                                });

                                let types = response.representativeType;
                                types.forEach((element) => {
                                    let type = {
                                        label: element,
                                        value: element
                                    };
                                    this.representativeOptions.push(type);
                                });

                                this.loaderSpinner = false;
                                this.showCharts = true;
                                this.init = false;
                            })
                            .catch((error) => {
                                console.log(error);
                                this.loaderSpinner = false;
                            });
                    } else {
                        this.loaderSpinner = false;
                    }

                    this.hasOrderData = true;
                    this.showDataError = false;
                } else {
                    this.loaderSpinner = false;
                    this.showDataError = true;
                }
            })
            .catch((error) => {
                console.log(error);
                this.loaderSpinner = false;
            });
    }

    setDoughnutChartData(data) {
        let listOfOrderProgram = [];
        let listOfOrderProgramDataCount = [];
        let listOfBackgroundColorOrder = [];
        let bgColor = this.mapChartBackgroundColor;
        let m = 0;
        let doughnut;

        data.forEach((element) => {
            if (element.hasOwnProperty("Program")) {
                listOfOrderProgram.push(
                    element.Program === "DirecTV"
                        ? "DIRECTV"
                        : element.Program === "Charter/Spectrum"
                        ? "Spectrum"
                        : element === "Altice"
                        ? "Optimum"
                        : element.Program
                );
                listOfOrderProgramDataCount.push(element.Orders);
                listOfBackgroundColorOrder.push(bgColor.get(element.Program));
                m++;
            }
        });

        if (listOfOrderProgramDataCount.length > 0) {
            doughnut = {
                type: "doughnut",
                data: {
                    labels: listOfOrderProgram,
                    datasets: [
                        {
                            defaultFontColor: "rgb(255,255,255)",
                            color: "rgb(255,255,255)",
                            data: listOfOrderProgramDataCount,
                            backgroundColor: listOfBackgroundColorOrder,
                            borderColor: listOfBackgroundColorOrder,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    aspectRatio: 1.3,
                    plugins: {
                        legend: {
                            labels: {
                                color: "rgb(255,255,255)"
                            },
                            title: {
                                display: false
                            },
                            position: "right"
                        }
                    }
                }
            };
        }
        this.oppDoughnutConfig = { ...doughnut };
        console.log(JSON.stringify(this.oppDoughnutConfig));
    }

    setBarChartData(data) {
        let ordersByRep = JSON.parse(JSON.stringify(data.ordersByRep));

        let listOfOrderReps = [];
        let listOfOrderRepsDataCount = [];

        ordersByRep.sort((a, b) => (a.Submitted > b.Submitted ? -1 : a.Submitted < b.Submitted ? 1 : 0));
        ordersByRep.forEach((element) => {
            if (element.hasOwnProperty("Submitted")) {
                listOfOrderReps.push(element.Name);
                listOfOrderRepsDataCount.push(element.Submitted);
            }
        });
        let bar = this.setBarConfig(listOfOrderReps, listOfOrderRepsDataCount, "Total Submitted Orders");

        let listOfPercentOrderReps = [];
        let listOfPercentOrderRepsDataCount = [];

        ordersByRep.sort((a, b) =>
            a.SubmittedPercentage > b.SubmittedPercentage ? -1 : a.SubmittedPercentage < b.SubmittedPercentage ? 1 : 0
        );
        ordersByRep.forEach((element) => {
            listOfPercentOrderReps.push(element.Name);
            listOfPercentOrderRepsDataCount.push(element.SubmittedPercentage);
        });

        let percentBar = this.setBarConfig(
            listOfPercentOrderReps,
            listOfPercentOrderRepsDataCount,
            "Submitted Order %"
        );

        let listOfDraftOrderReps = [];
        let listOfDraftOrderRepsDataCount = [];

        ordersByRep.sort((a, b) => (a.Draft > b.Draft ? -1 : a.Draft < b.Draft ? 1 : 0));
        ordersByRep.forEach((element) => {
            if (element.hasOwnProperty("Draft")) {
                listOfDraftOrderReps.push(element.Name);
                listOfDraftOrderRepsDataCount.push(element.Draft);
            }
        });

        let draftBar = this.setBarConfig(listOfDraftOrderReps, listOfDraftOrderRepsDataCount, "Sum of Draft #");

        this.orderBarconfig = { ...bar };
        this.orderPercentBarConfig = { ...percentBar };
        this.orderDraftBarConfig = { ...draftBar };
    }

    setNumberChartsData(numberChartData) {
        let orderData = [];
        for (const key in numberChartData) {
            let title;
            let order;
            let type;
            let reportName;
            let reportId;

            switch (key) {
                case "Draft":
                    title = "Total Orders in Draft Status";
                    order = 1;
                    type = "number";
                    reportName = "Total Orders";
                    reportId = this.reportsByName[reportName];
                    break;
                case "TotalSubmitted":
                    title = "Total Submitted Orders";
                    order = 2;
                    type = "number";
                    reportName = "Total Orders";
                    reportId = this.reportsByName[reportName];
                    break;
                case "Activated":
                    title = "Total Activated Orders";
                    order = 3;
                    type = "number";
                    reportName = "Total Orders";
                    reportId = this.reportsByName[reportName];
                    break;
                case "ordersByRepByDayAVG":
                    title = "AVG Orders Submitted by Rep by Day";
                    order = 4;
                    type = "number";
                    reportName = "Orders By Rep By Day AVG";
                    reportId = this.reportsByName[reportName];
                    break;
                case "ActivationPercentage":
                    title = "Activation %";
                    order = 5;
                    type = "percent";
                    reportName = "Completed Order %";
                    reportId = this.reportsByName[reportName];
                    break;
                case "SubmittedPercentage":
                    title = "Submitted Order %";
                    order = 6;
                    type = "percent";
                    reportName = "Completed Order %";
                    reportId = this.reportsByName[reportName];
                    break;
            }

            if (title != undefined) {
                let element = {
                    title: title,
                    amount: numberChartData[key],
                    order: order,
                    type: type,
                    key: key,
                    greenValue: 67,
                    redValue: 33,
                    reportName: reportName,
                    reportId: reportId
                };
                orderData.push(element);
            }
        }
        orderData.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
        this.orderData = orderData;
    }

    setBarConfig(labels, dataCount, title) {
        let listOfBackgroundColor = [];

        for (let i = 1; i <= labels.length; i++) {
            listOfBackgroundColor.push("rgb(46,151,238)");
        }

        let bar = {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: title,
                        data: dataCount,
                        backgroundColor: listOfBackgroundColor,
                        borderColor: listOfBackgroundColor,
                        borderWidth: 1,
                        barPercentage: 0.9,
                        categoryPercentage: 1
                    }
                ]
            },
            options: {
                responsive: true,
                indexAxis: "y",
                maintainAspectRatio: false,
                hover: {
                    animationDuration: 0
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            autoSkip: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        ticks: {
                            autoSkip: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top"
                    }
                }
            }
        };

        return bar;
    }

    handleChange(event) {
        this.hasOrderData = false;
        switch (event.target.name) {
            case "program":
                this.programSelected = event.target.value;
                break;
            case "representative":
                this.typeSelected = event.target.value;
                break;
            case "startDate":
                this.dateSelected = event.target.value;
                if (event.target.value == "Custom") {
                    this.showDatePicker = true;
                    this.loaderSpinner = false;
                    return;
                } else {
                    this.showDatePicker = false;
                }
                break;
        }
        this.getOrdersData();
    }

    handleDatePickerChange(event) {
        if (event.target.name == "start") {
            this.startDate = event.target.value;
        } else {
            this.endDate = event.target.value;
        }

        if (this.startDate != null && this.endDate != null && this.startDate < this.endDate) {
            this.loaderSpinner = true;
            this.hasError = false;
            this.getOrdersData();
        } else if (this.startDate != null && this.endDate != null && this.startDate > this.endDate) {
            this.hasError = true;
            this.dateError = '"From" date must be less than "To" date.';
        }
    }
}