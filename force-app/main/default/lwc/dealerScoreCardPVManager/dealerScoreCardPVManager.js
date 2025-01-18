import { LightningElement } from "lwc";
import getData from "@salesforce/apex/POE_DealerScoreCardController.getData";

export default class DealerScoreCardPVManager extends LightningElement {
    showLoaderSpinner;
    accountName;
    dealerRanking;
    ytdHeadcount;
    dhcWorked;
    dhcSold;
    avgSale;
    prodMix;
    crossSell;
    hoursAvgDaily;
    conversations;
    pitches;
    sales;
    productsSold;
    dhw10;
    dhw20;
    dhw30;
    dhs10;
    dhs20;
    dhs30;
    hc10;
    hc20;
    hc30;
    account;
    options;
    dhw10retail;
    dhw10event;
    dhw10callcenter;
    dhw10d2d;
    dhw20retail;
    dhw20event;
    dhw20callcenter;
    dhw20d2d;
    dhw30retail;
    dhw30event;
    dhw30callcenter;
    dhw30d2d;
    hc10event;
    hc10retail;
    hc10d2d;
    hc10callcenter;
    hc20event;
    hc20retail;
    hc20d2d;
    hc20callcenter;
    hc30event;
    hc30retail;
    hc30d2d;
    hc30callcenter;
    dhs10event;
    dhs10retail;
    dhs10callcenter;
    dhs10d2d;
    dhs20event;
    dhs20retail;
    dhs20callcenter;
    dhs20d2d;
    dhs30event;
    dhs30retail;
    dhs30callcenter;
    dhs30d2d;

    connectedCallback() {}

    lookupRecord(event) {
        if (event.detail.selectedRecord !== undefined) {
            let record = JSON.parse(JSON.stringify(event.detail.selectedRecord));
            this.accountName = record.Name;
            this.callData(record.Id);
        }
    }

    callData(id) {
        this.showLoaderSpinner = true;
        getData({
            isManager: true,
            accountId: id
        })
            .then((result) => {
                let ordersQ = result.totalOrders;
                console.log(result);
                this.dealerRanking = result.dealerRanking;
                this.ytdHeadcount = result.ytdHeadcount;
                this.dhcWorked = result.dailyHeadcountWorked;
                this.dhcSold = result.dailyHeadCountSold;
                this.avgSale = Number(result.averageSale).toFixed(2);
                this.prodMix =
                    result.dailyHeadCountSold == 0
                        ? (0.0).toFixed(2)
                        : (result.productMix / result.dailyHeadCountSold).toFixed(2);
                this.crossSell = ordersQ == 0 ? (0.0).toFixed(2) : (result.crossSell / ordersQ).toFixed(2);
                this.hoursAvgDaily = Number(result.averageDaily);
                this.conversations = result.conversations;
                this.pitches = result.pitches;
                this.sales = Number(result.sales).toFixed(2);
                this.productsSold = [...result.productsSold];
                this.dhw10 = Number(result.dhw10);
                this.dhw20 = Number(result.dhw20);
                this.dhw30 = Number(result.dhw30);
                this.dhs10 = Number(result.dhs10);
                this.dhs20 = Number(result.dhs20);
                this.dhs30 = Number(result.dhs30);
                this.hc10 = Number(result.headcount10);
                this.hc20 = Number(result.headcount20);
                this.hc30 = Number(result.headcount30);
                this.hc10event = Number(result.headcount10event);
                this.hc10retail = Number(result.headcount10retail);
                this.hc10d2d = Number(result.headcount10d2d);
                this.hc10callcenter = Number(result.headcount10callcenter);
                this.hc20event = Number(result.headcount20event);
                this.hc20retail = Number(result.headcount20retail);
                this.hc20d2d = Number(result.headcount20d2d);
                this.hc20callcenter = Number(result.headcount20callcenter);
                this.hc30event = Number(result.headcount30event);
                this.hc30retail = Number(result.headcount30retail);
                this.hc30d2d = Number(result.headcount30d2d);
                this.hc30callcenter = Number(result.headcount30callcenter);
                this.dhs10event = Number(result.dhs10event);
                this.dhs10retail = Number(result.dhs10retail);
                this.dhs10callcenter = Number(result.dhs10callcenter);
                this.dhs10d2d = Number(result.dhs10d2d);
                this.dhs20event = Number(result.dhs20event);
                this.dhs20retail = Number(result.dhs20retail);
                this.dhs20callcenter = Number(result.dhs20callcenter);
                this.dhs20d2d = Number(result.dhs20d2d);
                this.dhs30event = Number(result.dhs30event);
                this.dhs30retail = Number(result.dhs30retail);
                this.dhs30callcenter = Number(result.dhs30callcenter);
                this.dhs30d2d = Number(result.dhs30d2d);
                this.dhw10retail = Number(result.dhw10retail);
                this.dhw10event = Number(result.dhw10event);
                this.dhw10callcenter = Number(result.dhw10callcenter);
                this.dhw10d2d = Number(result.dhw10d2d);
                this.dhw20retail = Number(result.dhw20retail);
                this.dhw20event = Number(result.dhw20event);
                this.dhw20callcenter = Number(result.dhw20callcenter);
                this.dhw20d2d = Number(result.dhw20d2d);
                this.dhw30retail = Number(result.dhw30retail);
                this.dhw30event = Number(result.dhw30event);
                this.dhw30callcenter = Number(result.dhw30callcenter);
                this.dhw30d2d = Number(result.dhw30d2d);
                this.showLoaderSpinner = false;
            })
            .catch((error) => {
                console.log(error);
                this.showLoaderSpinner = false;
            });
    }
}