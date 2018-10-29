import { Component} from '@angular/core';
import {PhoneauthPage} from '../../../pages/id/phoneauth/phoneauth';
import {PersonWriteChainPage} from "../../../pages/id/kyc/person-write-chain/person-write-chain";
import {IDManager} from "../../../providers/IDManager";
import {ApiUrl} from "../../../providers/ApiUrl";
import {Config} from "../../../providers/Config";
import { NavController, NavParams} from 'ionic-angular';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";

@Component({
  selector: 'page-phonepathinfo',
  templateUrl: 'phonepathinfo.html',
})
export class PhonepathinfoPage{
  //public phonepathlist = [{'pathStatus':4,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}},{'pathStatus':5,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}},{'pathStatus':4,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}},{'pathStatus':4,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}}];
  public phonepathlist = [];
  private parmar ={};
  public idsObj ={};
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public localStorage: LocalStorage,public dataManager :DataManager){
    this.init();
}
  init(){
   this.parmar = this.navParams.data;
   console.log("---path---"+JSON.stringify(this.parmar));
//<<<<<<< HEAD
  // this.setTitleByAssets("phone-path-deatils");
    let masterWalletId = Config.getCurMasterWalletId();

   this.localStorage.getKyc().then((val)=>{
// =======
//    this.localStorage.get("kycId").then((val)=>{
// >>>>>>> origin/wallet_dev
    if(val == null || val === undefined || val === {} || val === ''){
      return;
     }
    this.idsObj = JSON.parse(val);

    let pathList = this.idsObj[masterWalletId][this.parmar["id"]][this.parmar["path"]];

    for(let key in pathList){
      pathList[key]["id"] = this.parmar["id"];
      pathList[key]["path"] = this.parmar["path"];
       this.phonepathlist.push(pathList[key]);
    }


  });
  }

  onNext(item){
    this.jumpPage(item);
  }

  onCommit(){
    this.native.Go(this.navCtrl,PhoneauthPage,this.parmar);
  }

  jumpPage(item){
    switch(item["pathStatus"]){
          case 0 :
            this.native.Go(PhoneauthPage,item);
            break;
          case 1:
             this.getAppAuth(item);
              break;
          case 2 :
             this.native.Go(this.navCtrl,PersonWriteChainPage,item);
              break;
    }
}


getAppAuth(item){
  let serialNum = item["serialNum"];
  let txHash =  item["txHash"];
  console.log("getAppAuth======= txHash type "+typeof(txHash));
  console.log('ElastosJs--phonepathinfo.tx--getAppAuth----'+"---serialNum---"+serialNum+"---txHash---"+txHash);
  let timestamp = this.native.getTimestamp();
  let parms ={"serialNum":serialNum,
              "txHash":txHash,
              "timestamp":timestamp,
             }
  let checksum = IDManager.getCheckSum(parms,"asc");
  parms["checksum"] = checksum;
  this.native.getHttp().postByAuth(ApiUrl.APP_AUTH,parms).toPromise().then().then(data => {
    if(data["status"] === 200){
      console.log("sssss======="+JSON.stringify(data));
      let authResult = JSON.parse(data["_body"]);
      if(authResult["errorCode"] === "1"){
        this.native.toast_trans("text-id-kyc-auth-fee-fail");
        return;
      }
      if(authResult["errorCode"] === "2"){
        this.native.toast_trans("text-id-kyc-auth-query-timeout");
               return;
      }
      if(authResult["errorCode"] === "4"){
         this.native.toast_trans("text-id-kyc-auth-uncompleted");
             return;
      }
      if(authResult["errorCode"] === "0"){
          //this.params["adata"] = authResult["data"];
          item["adata"] = authResult["data"];

        if (authResult["data"].length > 0){
          var signCont = JSON.parse(JSON.stringify(authResult["data"][0]));


          if(signCont["result"] == "success"){
            this.saveSerialNumParm(serialNum,item, 2);
          }
          else{
            this.saveSerialNumParm(serialNum,item, 3);
          }
          let resultSign = signCont["resultSign"];
          delete signCont["resultSign"];
          this.dataManager.addSignCont(resultSign, signCont);

        }
      }
     }
  }).catch(error => {

  });
}

//<<<<<<< HEAD
saveSerialNumParm(serialNum,item, pathStatus){
  let masterWalletId = Config.getCurMasterWalletId();

  item["pathStatus"] = pathStatus;
   this.idsObj[masterWalletId][this.parmar["id"]][this.parmar["path"]][serialNum]= item;
   this.localStorage.setKyc(this.idsObj).then(()=>{

     if(item["pathStatus"]  == 2) {
       this.native.Go(PersonWriteChainPage, item);
     }

// =======
// saveSerialNumParm(serialNum,item){
//    item["pathStatus"] = 2;
//    this.idsObj[this.parmar["id"]][this.parmar["path"]][serialNum]= item;
//    this.localStorage.set("kycId",this.idsObj).then(()=>{
//      this.native.Go(PersonWriteChainPage,item);
// >>>>>>> origin/wallet_dev
   });
}
}
