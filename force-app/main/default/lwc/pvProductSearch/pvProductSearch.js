import { LightningElement,api,track } from 'lwc';
import getServiceTerritories from '@salesforce/apex/PV_ManageServiceResources.getServiceTerritories';   
import getResults from '@salesforce/apex/PV_InventoryController.getResults';
import checkforSerilaized from '@salesforce/apex/PV_InventoryController.serializedProductCheck';

export default class pvProductSearch extends LightningElement {
    
    ServiceTerritories;  
    loading='loading...'
    Noresult='No results found'
    NoResultText=false;
    @api LoadingText=false;
    error;  
    @api searchKey;
    selectedstId;
    @api rowindex;
    @api recordId;
    handleChange( event ) {
        this.LoadingText=true;
        this.NoResultText = false;
        console.log('search'+event.detail.value)
        if(event.detail.value==null ||event.detail.value==''){

            this.dispatchEvent(new CustomEvent("productselect", {
                detail:{
                    IndexId:this.rowindex,
                    productid:'',
                    isSerialized:'',
                    productname:''
               
                  }
              }));
              this.LoadingText=false;
              this.NoResultText = false;
        }
        this.searchKey = event.detail.value;

        if ( this.searchKey ) {  
    
            getResults({ searchTerm:this.searchKey,ObjectName:'Product2' })
            .then( result => {  
              console.log('lenghth'+this.searchKey.length );
                if( this.searchKey.length>0 && result.length===0) {
                    console.log(result);
                    this.NoResultText = true;
                }
                else {
                    this.NoResultText = false;
                    this.ServiceTerritories = result;    
                }
          
                this.LoadingText=false;
                console.log(JSON.stringify(ServiceTerritories));
            } )  
            .catch( error => {  
                
                this.error = error;  
                console.log(error);
                this.LoadingText=false;
                this.NoResultText = false;
            } );  
    
        } else  {

            this.ServiceTerritories = undefined;  
            this.LoadingText=false;
            this.NoResultText = false;

        }

    }

    handleSelect( event ) {
        this.NoResultText = false;
        this.LoadingText=false;
        console.log(event.currentTarget.dataset.id);
        let strIndex = event.currentTarget.dataset.id;
        let tempRecs =  JSON.parse( JSON.stringify( this.ServiceTerritories ) );
        let selectedRecId = tempRecs[ strIndex ].recId;
        let strSTName = tempRecs[ strIndex ].recName;
        this.selectedstId = selectedRecId;
        this.searchKey = strSTName;
        console.log(this.searchKey );
        this.ServiceTerritories = undefined;
        checkforSerilaized({ productId:this.selectedstId })
        .then( result => {  
           
      console.log('isserilaed'+result)

      this.dispatchEvent(new CustomEvent("productselect", {
        detail:{
            IndexId:this.rowindex,
            productid:this.selectedstId,
            isSerialized:result,
            productname:strSTName
       
          }
      }));
        } )  
        .catch( error => {  
            
            this.error = error;  
            console.log(error.body.message);
        } );  
         

    }

    @api clearselected(){

        this.selectedstId =null;
    }

}