sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/TextArea",
    "sap/m/TimePicker",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
   

], function (
    Controller,
    JSONModel,
    Input,
    DatePicker,
    TextArea,
    TimePicker,
    Filter,
    FilterOperator,
   
) {
    "use strict";

    return Controller.extend("taqa.claims.report.taqaclaimsreport.controller.BaseController", {

        openDialog: function (name, path) {
            var sname = name;
            this.mDialogs = this.mDialogs || {};
            var oDialog = this.mDialogs[sname];
            if (!oDialog) {
                oDialog = this.loadFragment({
                    name: path,
                    type: "XML",
                    controller: this

                });
                this.mDialogs[sname] = oDialog;
            }
            oDialog.then(function (pDialog) {
                pDialog.open();
            });
        },

        declareModel: function (modelName) {
            this.getView().setModel(new JSONModel({}), modelName);
        },

        ReadOdata: function (oModel, sPath, oFilters, oUrlParameters = {}) {
            return new Promise(function (resolve, reject) {
                oModel.read(sPath, {
                    filters: oFilters,
                    urlParameters: oUrlParameters,
                    success: function (odata) {
                        resolve(odata);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                })
            })
        },

        CRDoData: function (oModel, sPath, oPayload) {
            return new Promise(function (resolve, reject) {
                oModel.create(sPath, oPayload, {
                    success: function (odata) {
                        resolve(odata);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                })
            })
        },

        DeleteRecord: function (oModel, sPath) {
            return new Promise(function (resolve, reject) {
                oModel.remove(sPath, {
                    success: function (odata) {
                        resolve(odata);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                })
            })
        },

        UpdateRecord: function (oModel, sPath, oPayload) {
            return new Promise(function (resolve, reject) {
                oModel.update(sPath, oPayload, {
                    success: function (odata) {
                        resolve(odata);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                })
            });
        },

        Tablerefresh: function (claimDetailFilter) {
            var that = this,
                oModel = this.getOwnerComponent().getModel("taqa-srv");
            

            return new Promise(function (resolve, reject) {
                oModel.read("/ClaimDetails", {
                    filters: claimDetailFilter,
                    success: function (odata) {
                        try{
                            that.getView().getModel("claimDetailModel").setData([]);
                            var claimRes = odata.results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            that.getView().getModel("claimDetailModel").setData(claimRes);
                        }
                        catch(err){
                            console.log(err);
                        }
                        resolve(odata);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                })
            })
        },
        
        dateFormatChange: function (sValue) {
            var odataformat = sValue+"T03:00:00";
            return odataformat
        },

        formatDateS: function (date) {
            var year = date.getFullYear();
            var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
            var day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
          },

        showHideColumnsVisibility: {
            claimDateCol: false,
            codeCol: false,
            billReceiptNumCol: false,
            descriptionCol: false,
            costElementCol:false,
            valueCol: false,
            amountCol: false,
            passengerCol: false,
            typeCol: false,
            academicStartCol: false,
            academicEndCol: false,
            ageOfChildId: false,
            payStartDateCol: false,
            payEndDateCol: false,
            nameChildCol: false,
            gradeChildCol: false,
            schoolLocCol: false,
            schoolNameCol: false,
            termClaimCol: false,
            attachmentCol: false
        },

        generalESRColumnsIds: [
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "costElementCol",
            "valueCol",
            "attachmentCol"
         ],
         medicalsubclaimColumnIds:[
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "costElementCol",
            "valueCol",
            "amountCol",
            "attachmentCol"
         ],
         clientEntertainmentColumnsIds:[
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "costElementCol",
            "valueCol",
            "amountCol",
            "attachmentCol"
         ],
         visaMedicalCostIds:[
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "costElementCol",
            "valueCol",
            "amountCol",
            "attachmentCol"
         ],
         unifiedColumnsIds:[
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "costElementCol",
            "valueCol",
            "amountCol",
            "attachmentCol"
         ],
         premedicalEmpClaimIds:[
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "costElementCol",
            "valueCol",
            "amountCol",
            "attachmentCol"
        ],
        airTicketColumnsIds: [
            "claimDateCol",
            "codeCol",
            "descriptionCol",
            "valueCol",
            "amountCol",
            "passengerCol",
            "typeCol",
            "attachmentCol"
        ],
        fullTutionColumnsIds: [
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "amountCol",
            "academicStartCol",
            "academicEndCol",
            "ageOfChildId",
            "nameChildCol",
            "gradeChildCol",
            "schoolLocCol",
            "schoolNameCol",
            "termClaimCol",
            "attachmentCol"
        ],
        educationMonthlyColumnsIds: [
            "claimDateCol",
            "codeCol",
            "billReceiptNumCol",
            "descriptionCol",
            "amountCol",
            "academicStartCol",
            "academicEndCol",
            "ageOfChildId",
            "payStartDateCol",
            "payEndDateCol",
            "nameChildCol",
            "gradeChildCol",
            "schoolLocCol",
            "schoolNameCol",
            "termClaimCol",
            "attachmentCol"
        ],

        benefitSubTypeList:[
            { code: "1160", description: "Travel Allowance" },
            { code: "2038", description: "Medical Consultation fee" },
            { code: "2234", description: "Education (ESR Child 2)" },
            { code: "2334", description: "Education (ESR Child 3)" },
            { code: "5008", description: "Helmet & Hard Hats" },
            { code: "5009", description: "HSEQ Expenses" },
            { code: "5016", description: "Risk Allowance(V)" },
            { code: "5017", description: "Parking Fee" },
            { code: "5020", description: "Training Expenses" },
            { code: "5021", description: "Transport Allowance(V)" },
            { code: "5022", description: "Work bonus" },
            { code: "5023", description: "Other Bonus" },
            { code: "5025", description: "Air Passage Allowance" },
            { code: "5026", description: "Air Ticket Encashment" },
            { code: "5028", description: "Camp Catering Expenses" },
            { code: "5029", description: "Car wash, Parking and veh" },
            { code: "5030", description: "Client Entertainment Reim" },
            { code: "5031", description: "Education (ESR Child 1)" },
            { code: "5032", description: "Emirates ID Cost Reimburs" },
            { code: "5035", description: "Other Safety Eqpt" },
            { code: "5036", description: "Pre-Employment Medical Re" },
            { code: "5037", description: "Travel Expense Claim" },
            { code: "5037", description: "Travel Expense Claim" },
            { code: "5038", description: "Taxi" },
            { code: "5039", description: "Uniforms" },
            { code: "5040", description: "Visa Medical Cost Reimbur" },
            { code: "5042", description: "Security pass" },
            { code: "5044", description: "Car Hire" },
            { code: "5045", description: "Other Transport Charges" },
            { code: "5046", description: "Visa Tax & Other Business" },
            { code: "5047", description: "Hotel Stay incl food" },
            { code: "5058", description: "Laundry Charges" },
            { code: "5059", description: "Printing and Stationery" },
            { code: "5060", description: "Vehicle Operating Cost" },
            { code: "5061", description: "Computer Stationery" },
            { code: "5062", description: "Cross BorderTransportation" },
            { code: "5063", description: "Guest House Expenses" },
            { code: "5064", description: "Visa & Work Permit Exp" },
            { code: "5068", description: "ADIPEC" },
            { code: "5070", description: "Refreshment Expenses" },
            { code: "5072", description: "Service Exp" },
            { code: "5073", description: "Postage/Courier" },
            { code: "5075", description: "Vehicle Hire - Pickups" },
            { code: "5076", description: "Vehicle Repairs" },
            { code: "5077", description: "Tools & Equpment Operatin" },
            { code: "5078", description: "Tools & Equpment Repair" },
            { code: "5080", description: "MOB&DEMOB EXPENSES" },
            { code: "5084", description: "Other Promotional Items" },
            { code: "5085", description: "Staff Welf, Parties & Cak" },
            { code: "5086", description: "Vehicle Hire - Trucks" },
            { code: "5087", description: "Subscriptions" },
            { code: "5088", description: "Air Fare- Business Travel" },
            { code: "5091", description: "MedicalTest" },
            { code: "5092", description: "Transporation" },
            { code: "5093", description: "Hotel and Food" },
            { code: "5094", description: "Supplies & Service" },
            { code: "5098", description: "School Pre Payment" },
            { code: "8203", description: "Visa Medical Cost Reimbur" }
        ],
        
        

        
            "companyCode": [
              { code: "2010", description: "AlMansoori Petroleum Services LLC, UAE" },
              { code: "2020", description: "AlMansoori Production Service LLC, UAE" },
              { code: "2100", description: "AlMansoori Wireline Services Company LLC, UAE" },
              { code: "2200", description: "AlMansoori Directional Drilling Services LLC, UAE" },
              { code: "2300", description: "AlMansoori Logging Services LLC, UAE" },
              { code: "2400", description: "AlMansoori Safety Services LLC, UAE" },
              { code: "2500", description: "AlMansoori Inspection Services Company LLC, UAE" },
              { code: "2600", description: "AlMansoori Petroleum Services Co. Ltd., KSA" },
              { code: "3010", description: "AlMansoori Petroleum Services, Bahrain" },
              { code: "3020", description: "AlMansoori Petroleum Services, Kurdistan" },
              { code: "3070", description: "AlMansoori Petroleum Services Co. Ltd., Kuwait" },
              { code: "3080", description: "AlMansoori Production Services Company LLC" },
              { code: "3090", description: "AlMansoori Wireline Services Company LLC" },
              { code: "3120", description: "AlMansoori Safety Services LLC" },
              { code: "3130", description: "AlMansoori Petroleum Services" },
              { code: "3140", description: "AlMansoori Petroleum Services, Bahrain" },
              { code: "3150", description: "AlMansoori Petroleum Services LLC(Project Office)" },
              { code: "3160", description: "Hilal Mubarak AlMansoori Trading Company, KSA" },
              { code: "3170", description: "AlMansoori Production Services India Private Limited" },
              { code: "3180", description: "AlMansoori Petroleum Services Limited" },
              { code: "3210", description: "AlMansoori Production Services Company LLC" },
              { code: "3220", description: "AlMansoori Wireline Services Company LLC" },
              { code: "3250", description: "AlMansoori Safety Services LLC" },
              { code: "3360", description: "AlMansoori Petroleum Services" },
              { code: "4010", description: "Geothermal KSA " }
            ],
          
          

        EmployeeIdList: [
            { id: "56", name: "kwt f2 test" },
            { id: "60", name: "kwt f2 test" },
            { id: "62", name: "kwt f2 test" },
            {id: "39359", name: "kwt f2 test" },
            { id: "39417", name: "kwt f2 test" },
            {id: "39333", name: "kwt f2 test" }

        ]
        
          
    });
});