import { LightningElement,api,track } from 'lwc';
import getResults from '@salesforce/apex/PV_InventoryController.getResults';

export default class PvLocaionSearch extends LightningElement {
    
    Locations;
    loading='loading...'
    Noresult='No results found'
    NoResultText=false;
    error;  
    @api searchKey;
    selectedstId;
    @api isDisabled=false;
    @api rowindex;
    @api recordId;
    @api LoadingText=false;
    @api fieldlabel='Location';

    handleChange( event ) {
        this.LoadingText=true;
        this.NoResultText = false;
        console.log('search'+event.detail.value)
        if(event.detail.value==null ||event.detail.value==''){

            this.dispatchEvent(new CustomEvent("locationselect", {
                detail:{
                    LocationId:'',
               
                  }
              }));
              this.LoadingText=false;
              this.NoResultText = false;
        }
        this.searchKey = event.detail.value;

        if ( this.searchKey ) {  
    
            getResults({ searchTerm:this.searchKey,ObjectName:'Location' })
            .then( result => {  

                if( this.searchKey.length > 0 && result.length == 0) {
                    this.NoResultText = true;
                    this.Locations = null;
                    
                }
                else {
                    this.NoResultText = false;
                    this.Locations = result;  
                }
                this.LoadingText=false;
            } )  
            .catch( error => {  
                
                this.error = error;  
                console.log(error);
                this.LoadingText=false;
                this.NoResultText = false;
            } );  
    
        } else  {

            this.Locations = undefined;  
            this.LoadingText=false;
            this.NoResultText = false;
        }

    }

    handleSelect( event ) {
        this.NoResultText = false;
        this.LoadingText=false;
        console.log(event.currentTarget.dataset.id);
        let strIndex = event.currentTarget.dataset.id;
        let tempRecs =  JSON.parse( JSON.stringify( this.Locations ) );
        let selectedRecId = tempRecs[ strIndex ].recId;
        let strSTName = tempRecs[ strIndex ].recName;
        this.selectedstId = selectedRecId;
        this.searchKey = strSTName;
        console.log(this.searchKey );
        this.Locations = undefined;
        this.dispatchEvent(new CustomEvent("locationselect", {
            detail:{
                LocationId:this.selectedstId,
           
              }
          }));

    }

    @api clearselected(){

        this.selectedstId =null;
    }

}