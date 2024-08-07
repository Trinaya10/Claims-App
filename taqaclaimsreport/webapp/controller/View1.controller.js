sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/TextArea",
    "sap/m/TextArea",
    "sap/m/TimePicker",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "../model/formatter"
],
function (Controller, BaseController, Filter, FilterOperator, JSONModel, Fragment, MessageBox, ValueHelpDialog, formatter) {
    "use strict";
    var oSFModel = '';
    var claimsDetails = [];
    var empDetailsList = [];

    return BaseController.extend("taqa.claims.report.taqaclaimsreport.controller.View1", {
        formatter: formatter,
        onInit: async function () {
            this.oFilterBar = this.getView().byId("benefitsTypeFilterInput"); 
            this.oTableView1 = this.getView().byId("newTableListId");
            var oBusyDialog = new sap.m.BusyDialog();
            oBusyDialog.open();

            var oSFModel = this.getOwnerComponent().getModel();
            this.declareModel('ClaimsList');
            this.declareModel('BenefitTypes');
            this.declareModel('BenefitSubTypeList');
            this.declareModel('CompanyCodeList');
            this.declareModel('EmployeeIdList');
            this.declareModel('showHideColumnsVisibility');

            this.getView().getModel('showHideColumnsVisibility').setData(this.showHideColumnsVisibility);
            this.getView().getModel('showHideColumnsVisibility').refresh()
            var benefitTypesData = [
                { code: "AT1001", description: "Air Ticket Encashment" },
                { code: "CE1001", description: "Client Entertainment Reimbursement" },
                { code: "ED1001", description: "Education Monthly" },
                { code: "FTA1001", description: "Full Tuition Assistance" },
                { code: "GESR1001", description: "General ESR" },
                { code: "MI1001", description: "Medical Insurance Claim" },
                { code: "PEM1001", description: "Pre-Employment Medical" },
                { code: "UID1001", description: "Unified ID/Visa Reimbursement" },
                { code: "VMCR1001", description: "Visa Medical Cost Reimbursement" }
            ]
            
            this.getView().setModel( new JSONModel(benefitTypesData), "BenefitTypes");
            this.getView().setModel(new JSONModel(this.benefitSubTypeList), 'BenefitSubTypeList');
            this.getView().setModel(new JSONModel(this.companyCode), 'CompanyCodeList');
            this.getView().setModel(new JSONModel(this.EmployeeIdList), 'EmployeeIdList');
            
            var userEmail = '';
            var user = sap.ushell.Container;
            if (user) {
                var userdata = sap.ushell.Container.getService("UserInfo").getUser();
                userEmail = userdata.getEmail() ? userdata.getEmail() : '';
            }
           

            var adminRes = await this.ReadOdata(oSFModel, '/EmpJob', [new Filter('userNav/email', FilterOperator.EQ, userEmail)], {$expand: "userNav, departmentNav"});
            var adminId = adminRes && Array.isArray(adminRes.results) && adminRes.results[0]?.userId || "39417";

            let userIdEmpFilter = this.EmployeeIdList.map(record => new Filter("userId", FilterOperator.EQ, record.id));
            let EmpJobFilter = [new Filter(userIdEmpFilter)]; //39417
            empDetailsList = await this.ReadOdata(oSFModel, '/EmpJob', EmpJobFilter, {$expand: "companyNav"});
            empDetailsList = empDetailsList.results;

            try{
                var userIdFilter = this.EmployeeIdList.map(record => new Filter("workerId", FilterOperator.EQ, record.id));
                var benefitEmpClaimsFilter = [new Filter(userIdFilter)]; //39417
                claimsDetails = await this.ReadOdata(oSFModel, '/BenefitEmployeeClaim', benefitEmpClaimsFilter, 
                    {$expand: "workerIdNav, cust_benGeneralESR/cust_AttachmentNav, cust_benAirticket/cust_AttachmentNav, cust_benClientEntertainment/cust_AttachmentNav, cust_benUnifiedID_VisaReimbursement/cust_AttachmentNav, cust_benVisaMedicalCostReimbursement/cust_AttachmentNav, cust_medicalSubClaim/cust_AttachmentNav, cust_benEducationMonthly/cust_AttachmentNav, cust_benPreEmploymentMedical/cust_AttachmentNav"});
                claimsDetails = claimsDetails.results;
                this.createBenefitClaimList();
            }
            catch(err){
                console.log(err);
            }
            oBusyDialog.close();
        },

        createBenefitClaimList: async function () {
            const claimList = [];
            claimsDetails.forEach((claimItem) => {
                let empDetail = empDetailsList.find(emp => emp.userId == claimItem.workerId);
                var claimDetail = {
                    "workerId": claimItem.workerId ,
                    "EmployeeName": claimItem.workerIdNav && claimItem.workerIdNav.displayName,
                    "CompanyCode": empDetail.company,
                    "CompanyDesc": empDetail.companyNav && empDetail.companyNav.name_defaultValue,
                    "CostCenter": empDetail.costCenter,
                    "BenefitType": claimItem.benefit,
                    "JobTitle": empDetail.jobTitle,
                    "Function": empDetail.businessUnit,
                    "Department": empDetail.department,
                    "Division": empDetail.division,
                    "LocationGroup": empDetail.customString7,
                    // "FromDate": claimItem.cust_FromDate && this.formatDateS(claimItem.cust_FromDate),
                    // "EndDate": claimItem.cust_EndDate && this.formatDateS(claimItem.cust_EndDate),
                    // "Purpose": claimItem.cust_Purpose,
                    // "Institution": claimItem.cust_Institution,
                    // "Location": claimItem.cust_Location,
                    // "Justification": claimItem.cust_Justification_of_the_request,
                    // "Visa": claimItem.cust_Visa,
                    // "Nationality": claimItem.cust_Nationality,
                    // "AcademicYear": claimItem.cust_AcademicYear,
                    // "ReasonForTravel": claimItem.cust_ReasonforTravel,
                    // "Destination": claimItem.cust_Destination,
                    // "TotalNumberOfTimesToClaim": claimItem.cust_TotalNumberOfTimesToClaim,
                    // "RemainingTimesToClaim": claimItem.cust_RemainingTimesToClaim
                };
                console.log("From Date", claimItem.cust_FromDate)
                console.log("End Date",claimItem.cust_EndDate)
                console.log("Job Title ", empDetail.jobTitle)
                console.log("Employee Name", claimItem.workerId)
                let claimResult = this.getBenefitTypeColumnsAndValues(claimItem);
                claimDetail = {
                    ...claimDetail,
                    "Benefitsubtype": claimResult.cust_code,
                    "ClaimDateFormat": claimResult.cust_claimDate,
                    "ClaimDate": claimResult.cust_claimDate && this.formatDateS(claimResult.cust_claimDate),
                    "Code": claimResult.cust_code,
                    "BillReceiptNumber": claimResult.cust_billReceiptNumber,
                    "Description": claimResult.cust_description,
                    "CostElement": claimResult.cust_costElement,
                    "Value": claimResult.cust_value, //not found in data
                    "Amount": claimResult.cust_amount,
                    "Passenger": claimResult.cust_Passangers,
                    "Type": claimResult.cust_Type,
                    "AcademicStartDate": claimResult.cust_acdstdate,
                    "AcademicEndDate": claimResult.cust_acdeddate,
                    "ChildAge": claimResult.cust_age,
                    "PaymentStartDate": claimResult.cust_PaymentStartDate,
                    "PaymentEndDate": claimResult.cust_PaymentEndDate,
                    "ChildName": claimResult.cust_childname,
                    "ChildGrade": claimResult.cust_gyofchild,
                    "SchoolLocation": claimResult.cust_locofscl,
                    "SchoolName": claimResult.cust_nameofscl,
                    "ClaimTerm": claimResult.cust_toclaim,
                    "Attachment": claimResult.cust_AttachmentNav?.fileContent,
                    "AttachmentType": claimResult.cust_AttachmentNav?.fileExtension,
                    "BenefitSubType": claimResult.cust_AttachmentNav?.cust_code
                }
                claimList.push(claimDetail);
               
                // console.log("Claim Date1",claimResult.cust_claimDate )
            });
            this.getView().getModel('ClaimsList').setData(claimList);
            // this.getView().getModel('EmployeeIdList').setData(claimList);

            this.getView().getModel('showHideColumnsVisibility').refresh();
        },

        getBenefitTypeColumnsAndValues: function (claimItem) {
            let claimResult = {}
            if (claimItem.benefit === "GESR1001") {
                if(claimItem.cust_benGeneralESR && Array.isArray(claimItem.cust_benGeneralESR.results) && claimItem.cust_benGeneralESR.results[0]){
                    claimResult = claimItem.cust_benGeneralESR.results[0];
                    console.log("General ESR",claimResult )
                }
                this.generalESRColumnsIds.forEach((item)=>{
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "AT1001") {
                if(claimItem.cust_benAirticket && Array.isArray(claimItem.cust_benAirticket.results) && claimItem.cust_benAirticket.results[0]){
                    claimResult = claimItem.cust_benAirticket.results[0];
                }
                this.airTicketColumnsIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "MI1001") {
                if(claimItem.cust_medicalSubClaim && Array.isArray(claimItem.cust_medicalSubClaim.results) && claimItem.cust_medicalSubClaim.results[0]){
                    claimResult = claimItem.cust_medicalSubClaim.results[0];
                }
                this.medicalsubclaimColumnIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "FTA1001") {
                if(claimItem.cust_benfulltutionassistance && Array.isArray(claimItem.cust_benfulltutionassistance.results) && claimItem.cust_benfulltutionassistance.results[0]){
                claimResult = claimItem.cust_benfulltutionassistance.results[0];
                }
                this.fullTutionColumnsIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "ED1001") {
                if(claimItem.cust_benEducationMonthly && Array.isArray(claimItem.cust_benEducationMonthly.results) && claimItem.cust_benEducationMonthly.results[0]) {
                    claimResult = claimItem.cust_benEducationMonthly.results[0];
                }
                this.educationMonthlyColumnsIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "CE1001") {
                if(claimItem.cust_benClientEntertainment && Array.isArray(claimItem.cust_benClientEntertainment.results) && claimItem.cust_benClientEntertainment.results[0]){
                    claimResult = claimItem.cust_benClientEntertainment.results[0];
                }
                this.clientEntertainmentColumnsIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "VMCR1001") {
                if(claimItem.cust_benVisaMedicalCostReimbursement && Array.isArray(claimItem.cust_benVisaMedicalCostReimbursement.results) && claimItem.cust_benVisaMedicalCostReimbursement.results[0]){
                    claimResult = claimItem.cust_benVisaMedicalCostReimbursement.results[0];
                }
                this.visaMedicalCostIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });    
            }
            else if (claimItem.benefit === "UID1001") {
                if(claimItem.cust_benUnifiedID_VisaReimbursement && Array.isArray(claimItem.cust_benUnifiedID_VisaReimbursement.results) && claimItem.cust_benUnifiedID_VisaReimbursement.results[0]){
                    claimResult = claimItem.cust_benUnifiedID_VisaReimbursement.results[0];
                }
                this.unifiedColumnsIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else if (claimItem.benefit === "PEM1001") {
                if(claimItem.cust_benPreEmploymentMedical && Array.isArray(claimItem.cust_benPreEmploymentMedical.results) && claimItem.cust_benPreEmploymentMedical.results[0]){
                    claimResult = claimItem.cust_benPreEmploymentMedical.results[0];
                }
                this.premedicalEmpClaimIds.forEach((item) => {
                    this.showHideColumnsVisibility[item] = true
                });
            }
            else {
                console.log("No Benefit Type found");
            }
            return claimResult;
        },

        getBenefitTypeFromCode: function(code) {
            var benefitTypes =  {
                    "GESR1001": "General ESR",
                    "AT1001": "Air Ticket Encashment",
                    "MI1001": "Medical Insurance Claim",
                    "FTA1001": "Full Tuition Assistance",
                    "ED1001": "Education Monthly",
                    "CE1001": "Client Entertainment Reimbursment",
                    "VMCR1001": "VisaMedicalCostReimbursement",
                    "UID1001": "Unified ID/Visa Reimbursement",
                    "PEM1001": "Pre-Employment Medical"
            }
            return benefitTypes[code];
        },

        //Employee Id
        onEmployeeIdValueHelp: function(oEvent) {
            this.openDialog("EmployeeIdList", "taqa.claims.report.taqaclaimsreport.fragments.EmployeeId")
        },

        onEmployeeIdSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
    
            // Create filters for code and description
            var oCodeFilter = new sap.ui.model.Filter("id", sap.ui.model.FilterOperator.Contains, sValue);
            var oDescriptionFilter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sValue);
            
            // Combine filters with OR condition
            var oCombinedFilter = new sap.ui.model.Filter({
                filters: [oCodeFilter, oDescriptionFilter],
                and: false
            });
        
            // Apply the filter to the binding
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oCombinedFilter]);
        },

        onEmployeeIdValueHelpOkPress: function(oEvent) {
            var selectedItems = oEvent.getParameters().selectedItems;
            var aTokens = [];
            selectedItems.forEach(function(oItem) {
                var sTitle = oItem.getTitle();
                if (sTitle) {
                    var oToken = new sap.m.Token({
                        text: sTitle
                    });
                    aTokens.push(oToken);
                }
            });
            this.getView().byId("employeeIdInput").setTokens(aTokens);
        },

        onEmployeeIdChange: function(c){
            const removedKey = c.getParameters().removedTokens[0].getText();
            const dialogItems = this.byId("employeeIdValueHelpDialog").getItems();
            var oItemToDeselect = dialogItems.find(function (oItem) {
                return oItem.getProperty("title") === removedKey;
            });
            if (oItemToDeselect) {
                oItemToDeselect.setSelected(false);
            }
            this.byId("employeeIdValueHelpDialog");
        },

        //Company Code
        oncompanyCodeValueHelp: function(oEvent) {
            this.openDialog("Companycode", "taqa.claims.report.taqaclaimsreport.fragments.Companycode")
        },

        onCompanyCodeSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
    
            // Create filters for code and description
            var oCodeFilter = new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sValue);
            var oDescriptionFilter = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue);
            
            // Combine filters with OR condition
            var oCombinedFilter = new sap.ui.model.Filter({
                filters: [oCodeFilter, oDescriptionFilter],
                and: false
            });
        
            // Apply the filter to the binding
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oCombinedFilter]);
        },

        onCompanyCodeValueHelpOkPress: function(oEvent) {
            var selectedItems = oEvent.getParameters().selectedItems;
            var aTokens = [];
            selectedItems.forEach(function(oItem) {
                var sTitle = oItem.getTitle();
                if (sTitle) {
                    var oToken = new sap.m.Token({
                        text: sTitle
                    });
                    aTokens.push(oToken);
                }
            });
            this.getView().byId("companyCodeInput").setTokens(aTokens);
        },

        oncompanyCodeChange: function(c){
            const removedKey = c.getParameters().removedTokens[0].getText();
            const dialogItems = this.byId("companyCodeValueHelpDialog").getItems();
            var oItemToDeselect = dialogItems.find(function (oItem) {
                return oItem.getProperty("title") === removedKey;
            });
            if (oItemToDeselect) {
                oItemToDeselect.setSelected(false);
            }
            this.byId("companyCodeValueHelpDialog");
        },

        //Sub Benefit Type
        onsubBenefitsTypeFilterValueHelp: function(oEvent) {
            // if (!this._oSubBenefitsTypeDialog) {
            //     this._oSubBenefitsTypeDialog = sap.ui.xmlfragment("taqa.claims.report.taqaclaimsreport.fragments.Benefitsubtype", this);
            //     this.getView().addDependent(this._oSubBenefitsTypeDialog);
            // }
            // this._oSubBenefitsTypeDialog.setModel(this.getView().getModel("BenefitSubTypeList"), "BenefitSubTypeList");
        
            // this._oSubBenefitsTypeDialog.open();
            this.openDialog("SubBenefitType", "taqa.claims.report.taqaclaimsreport.fragments.Benefitsubtype")

        },

        onSubBenefitsTypeFilterSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
    
            // Create filters for code and description
            var oCodeFilter = new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sValue);
            console.log("Code Filter",oCodeFilter)
            var oDescriptionFilter = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue);
            console.log("Description Filter",oDescriptionFilter)
            
            // Combine filters with OR condition
            var oCombinedFilter = new sap.ui.model.Filter({
                filters: [oCodeFilter, oDescriptionFilter],
                and: false
            });
        
            // Apply the filter to the binding
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oCombinedFilter]);
        },

        onSubBenefitsTypeFilterValueHelpOkPress: function(oEvent) {
            var selectedItems = oEvent.getParameters().selectedItems;
            var aTokens = [];
            selectedItems.forEach(function(oItem) {
                var sTitle = oItem.getTitle();
                if (sTitle) {
                    var oToken = new sap.m.Token({
                        text: sTitle
                    });
                    aTokens.push(oToken);
                }
            });
            this.getView().byId("subBenefitsTypeFilterInput").setTokens(aTokens);
        },

        onsubBenefitsTypeFilterInputChange: function(c){
            const removedKey = c.getParameters().removedTokens[0].getText();
            const dialogItems = this.byId("subBenefitsTypeFilterValueHelpDialog").getItems();
            var oItemToDeselect = dialogItems.find(function (oItem) {
                return oItem.getProperty("title") === removedKey;
            });
            if (oItemToDeselect) {
                oItemToDeselect.setSelected(false);
            }
            this.byId("subBenefitsTypeFilterValueHelpDialog");
        },
        
        //Benefit Type
        onbenefitsTypeFilterValueHelp: function(oEvent) {
            // if (!this._oBenefitsTypeDialog) {
            //     this._oBenefitsTypeDialog = sap.ui.xmlfragment("taqa.claims.report.taqaclaimsreport.fragments.Benefittype", this);
            //     this.getView().addDependent(this._oBenefitsTypeDialog);
            // }
            // this._oBenefitsTypeDialog.setModel(this.getView().getModel("BenefitTypes"), "BenefitTypes");
            // this._oBenefitsTypeDialog.open();
            this.openDialog("BenefitType", "taqa.claims.report.taqaclaimsreport.fragments.Benefittype");
        },

        onbenefitsTypeFilterInputChange: function(c){
            const removedKey = c.getParameters().removedTokens[0].getText();
            const dialogItems = this.byId("benefitsTypeFilterValueHelpDialog").getItems();
            var oItemToDeselect = dialogItems.find(function (oItem) {
                return oItem.getProperty("title") === removedKey;
            });
            if (oItemToDeselect) {
                oItemToDeselect.setSelected(false);
            }
            this.byId("benefitsTypeFilterValueHelpDialog");
        },

        onBenefitsTypeFilterSearch: function(oEvent) {
            
            var sValue = oEvent.getParameter("value");
    
            // Create filters for code and description
            var oCodeFilter = new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sValue);
            var oDescriptionFilter = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue);
            
            // Combine filters with OR condition
            var oCombinedFilter = new sap.ui.model.Filter({
                filters: [oCodeFilter, oDescriptionFilter],
                and: false
            });
        
            // Apply the filter to the binding
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oCombinedFilter]);
        },
        
        onBenefitsTypeFilterValueHelpOkPress: function(oEvent) {
            var selectedItems = oEvent.getParameters().selectedItems;
            var aTokens = [];
            selectedItems.forEach(function(oItem) {
                var sTitle = oItem.getTitle("items");
                if (sTitle) {
                    var oToken = new sap.m.Token({
                        text: sTitle
                    });
                    aTokens.push(oToken);
                }
            });
            this.getView().byId("benefitsTypeFilterInput").setTokens(aTokens);
        },
       
        handleDownloadpress: function (oEvent) {
            var oButton = oEvent.getSource().getBindingContext("ClaimsList").getObject();
            var fileContent = oButton.Attachment;
            var fileType = oButton.AttachmentType;
            let newWindow = undefined;
            if(fileContent){
                if (['application/pdf', 'pdf'].includes(fileType)) {
                    // For PDF files, open in a new window/tab
                    const byteCharacters = atob(fileContent);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    const fileURL = URL.createObjectURL(blob);
                    newWindow = window.open(fileURL);
                } else if (['image/jpeg', 'image/png', 'png', 'img', 'jpeg', 'jpg'].includes(fileType)) {
                    // For PNG and JPEG images, create an img element
                    newWindow = window.open('');
                    const img = new Image();
                    img.src = 'data:' + fileType + ';base64,' + fileContent;
                    // Open the image in a new window/tab
                    newWindow.document.write('<html><head><title>Image</title></head><body></body></html>');
                    newWindow.document.body.appendChild(img);
                } else {
                    // Unsupported file type
                    window.alert('Unsupported file type: ' + fileType);
                }
                if (!newWindow) {
                    window.alert('Pop-up blocker is enabled! Please allow pop-ups for this site.');
                }
            }
            else {
                window.alert("No Attachment Present to download");
            }
        },

        onSearch: function () {
            var that = this;
            that.setColumnsVisibility(true);
            // Ensure oFilterBar and oTableView1 are available
            if (!that.oFilterBar || !that.oTableView1) {
                console.error("FilterBar or TableView is not initialized.");
                return;
            }
            var oView = this.getView();

            var startDate = oView.byId("date").getDateValue();
            console.log(startDate)
            var endDate = oView.byId("date").getSecondDateValue();
            //date filter
            var aTableFilters=[];
            if(startDate && endDate) {
                aTableFilters.push(new Filter("ClaimDate", FilterOperator.BT, this.formatDateS(new Date(startDate)), this.formatDateS(new Date(endDate))));
            }

            var employeeIdFilterSelected = this.getView().byId("employeeIdInput").getTokens().map(function (token) {
                return token.getText();
            });
            if(employeeIdFilterSelected && employeeIdFilterSelected.length){
                const empFiltersProject = employeeIdFilterSelected.map(function (sTokenValue) {
                    return new Filter("workerId", FilterOperator.EQ, sTokenValue);
                });
                aTableFilters.push(new Filter({
                    filters: empFiltersProject,
                    and: false
                }));
            }

            // Add additional filter for benefit type
            var benefittype = this.getView().byId("benefitsTypeFilterInput").getTokens().map(function (token) {
                return token.getText();
            });
            if (benefittype && benefittype.length) {
                this.setColumnsVisibility(false);
                const aFiltersProject = benefittype.map(function (sTokenValue) {
                    that.getBenefitTypeColumnsAndValues({benefit: sTokenValue});
                    return new Filter("BenefitType", FilterOperator.EQ, sTokenValue);
                });

                aTableFilters.push(new Filter({
                    filters: aFiltersProject,
                    and: false
                }));
            }

            var companycode = this.getView().byId("companyCodeInput").getTokens().map(function (token) {
                return token.getText();
            });
            if (companycode && companycode.length) {
                var aFiltersProject = companycode.map(function (sTokenValue) {
                    return new Filter("CompanyCode", FilterOperator.Contains, sTokenValue);
                });
                aTableFilters.push(new Filter({
                    filters: aFiltersProject,
                    and: false
                }));
            }
            
            var subBenefitType = this.getView().byId("subBenefitsTypeFilterInput").getTokens().map(function (token) {
                return token.getText();
            });
            if (subBenefitType && subBenefitType.length) {
                const aFiltersProject = subBenefitType.map(function (sTokenValue) {
                    return new Filter("Code", FilterOperator.EQ, sTokenValue);
                });
                aTableFilters.push(new Filter({
                    filters: aFiltersProject,
                    and: false
                }));
            }
            
            this.getView().getModel('showHideColumnsVisibility').refresh();
            // Log the oTableView1 for debugging purposes
            window.console.log(this.oTableView1);
            var oTableView1 = this.getView().byId("newTableId");
            // Apply filters to the table
            var oTableBinding = oTableView1.getBinding("items");
            console.log("Table Binding",oTableBinding)
            oTableBinding.filter(aTableFilters);
            // oTableView1.setShowOverlay(false);
        },
        onReset: function(oEvent) {
            // Reset filter values
            var oView = this.getView();
            oView.byId("date").setDateValue(null);
            // oView.byId("projectCodeInput").setTokens([]);
        },
        
        setColumnsVisibility: function(val) {
            this.generalESRColumnsIds.forEach((item)=>{
                this.showHideColumnsVisibility[item] = val
            });
            this.medicalsubclaimColumnIds.forEach((item)=>{
                this.showHideColumnsVisibility[item] = val
            });
            this.clientEntertainmentColumnsIds.forEach((item)=>{
                this.showHideColumnsVisibility[item] = val
            });
            this.visaMedicalCostIds.forEach((item)=> {
                this.showHideColumnsVisibility[item] = val
            });
            this.unifiedColumnsIds.forEach((item)=> {
                this.showHideColumnsVisibility[item] = val
            });
            this.premedicalEmpClaimIds.forEach((item)=> {
                this.showHideColumnsVisibility[item] = val
            });
            this.airTicketColumnsIds.forEach((item)=> {
                this.showHideColumnsVisibility[item] = val
            });
            this. fullTutionColumnsIds.forEach((item) => {
                this.showHideColumnsVisibility[item] = val
            });
            this.educationMonthlyColumnsIds.forEach((item) => {
                this.showHideColumnsVisibility[item] = val
            });

            this.getView().getModel('showHideColumnsVisibility').refresh();
        },
        onValueHelpCancelPress: function(c) {
            
            console.log();
        },

        onDownloadPress: function () {
            var data = this.getView().getModel("ClaimsList").getData();
            var rows = data.map(function (claimItem) {
                return {
                    "Employee ID": claimItem.workerId,
                    "Employee Name": claimItem.EmployeeName,
                    "Company Code": claimItem.CompanyCode,
                    "Company Description": claimItem.CompanyDesc,
                    "Cost Center": claimItem.CostCenter,
                    "Benefit Types": claimItem.BenefitType,
                    "Benefits Sub Type": claimItem.Code,
                    "workerId": claimItem.workerId,
                    "EmployeeName": claimItem.workerIdNav && claimItem.workerIdNav.displayName,
                    "CompanyCode": claimItem.workerIdNav && claimItem.workerIdNav.custom01,
                    "CompanyDesc": claimItem.workerIdNav && claimItem.workerIdNav.custom01,
                    "CostCenter": "empData.costCenter",
                    "JobTitle": claimItem.JobTitle,
                    "Function": claimItem.Function,
                    "Department": claimItem.Department,
                    "Division": claimItem.Division,
                    "LocationGroup": claimItem.LocationGroup,
                    // "From Date": claimItem.FromDate,
                    // "End Date": claimItem.EndDate,
                    // "Purpose": claimItem.Purpose,
                    // "Institution": claimItem.Institution,
                    // "Location": claimItem.Location,
                    // "Justification": claimItem.Justification,
                    // "Visa": claimItem.Visa,
                    // "Nationality": claimItem.Nationality,
                    // "Academic Year": claimItem.AcademicYear,
                    // "Reason For Travel": claimItem.ReasonForTravel,
                    // "Destination": claimItem.Destination,
                    // "Total Number Of Times To Claim": claimItem.TotalNumberOfTimesToClaim,
                    // "Remaining Times To Claim": claimItem.RemainingTimesToClaim,
                    "Claim Date": claimItem.ClaimDate,
                    "Code": claimItem.Code,
                    "Bill/Receipt Number": claimItem.BillReceiptNumber,
                    "Description": claimItem.Description,
                    "Cost Element": claimItem.CostElement,
                    "Value": claimItem.Value,
                    "Amount": claimItem.Amount,
                    "Passenger": claimItem.Passenger,
                    "Type": claimItem.Type,
                    "Academic Start Date": claimItem.AcademicStartDate,
                    "Academic End Date": claimItem.AcademicEndDate,
                    "Age Of Child": claimItem.ChildAge,
                    "Payment Start Date": claimItem.PaymentStartDate,
                    "Payment End Date": claimItem.PaymentEndDate,
                    "Name Of Child": claimItem.ChildName,
                    "Grade Of Child": claimItem.ChildGrade,
                    "Location Of School": claimItem.SchoolLocation,
                    "Name Of School": claimItem.SchoolName,
                    "Term Of Claim": claimItem.ClaimTerm
                };
            });
            var aColumns = [
                { label: 'Employee ID', property: 'Employee ID', type: 'string' },
                { label: 'Employee Name', property: 'Employee Name', type: 'string' },
                { label: 'Company Code', property: 'Company Code', type: 'string' },
                { label: 'Company Description', property: 'Company Description', type: 'string' },
                { label: 'Cost Center', property: 'Cost Center', type: 'string' },
                { label: 'Benefit Types', property: 'Benefit Types', type: 'string' },
                { label: 'Benefits Sub Type', property: 'Benefits Sub Type', type: 'string' },

                { label: 'JobTitle', property: 'JobTitle', type: 'string' },
                { label: 'Function', property: 'Function', type: 'string' },
                { label: 'Department', property: 'Department', type: 'string' },
                { label: 'LocationGroup', property: 'LocationGroup', type: 'string' },
                { label: 'Division', property: 'Division', type: 'string' },
                // { label: 'From Date', property: 'From Date', type: 'string' },
                // { label: 'End Date', property: 'End Date', type: 'string' },
                // { label: 'Purpose', property: 'Purpose', type: 'string' },
                // { label: 'Institution', property: 'Institution', type: 'string' },
                // { label: 'Location', property: 'Location', type: 'string' },
                // { label: 'Justification', property: 'Justification', type: 'string' },
                // { label: 'Visa', property: 'Visa', type: 'string' },
                // { label: 'Nationality', property: 'Nationality', type: 'string' },
                // { label: 'Academic Year', property: 'Academic Year', type: 'string' },
                // { label: 'Reason For Travel', property: 'Reason For Travel', type: 'string' },
                // { label: 'Destination', property: 'Destination', type: 'string' },
                // { label: 'Total Number Of Times To Claim', property: 'Total Number Of Times To Claim', type: 'string' },
                // { label: 'Remaining Times To Claim', property: 'Remaining Times To Claim', type: 'string' },
                { label: 'Claim Date', property: 'Claim Date', type: 'string' },
                { label: 'Code', property: 'Code', type: 'string' },
                { label: 'Bill/Receipt Number', property: 'Bill/Receipt Number', type: 'string' },
                { label: 'Description', property: 'Description', type: 'string' },
                { label: 'Cost Element', property: 'Cost Element', type: 'string' },
                { label: 'Value', property: 'Value', type: 'string' },
                { label: 'Amount', property: 'Amount', type: 'string' },
                { label: 'Passenger', property: 'Passenger', type: 'string' },
                { label: 'Type', property: 'Type', type: 'string' },
                { label: 'Academic Start Date', property: 'Academic Start Date', type: 'string' },
                { label: 'Academic End Date', property: 'Academic End Date', type: 'string' },
                { label: 'Age Of Child', property: 'Age Of Child', type: 'string' },
                { label: 'Payment Start Date', property: 'Payment Start Date', type: 'string' },
                { label: 'Payment End Date', property: 'Payment End Date', type: 'string' },
                { label: 'Name Of Child', property: 'Name Of Child', type: 'string' },
                { label: 'Grade Of Child', property: 'Grade Of Child', type: 'string' },
                { label: 'Location Of School', property: 'Location Of School', type: 'string' },
                { label: 'Name Of School', property: 'Name Of School', type: 'string' },
                { label: 'Term Of Claim', property: 'Term Of Claim', type: 'string' }
            ];
        
            // Configure export settings
            var oSettings = {
                workbook: {
                    columns: aColumns,
                    context: {
                        sheetName: "Claim Report"
                    }
                },
                dataSource: rows,
                fileName: 'ClaimReport.xlsx'
            };
        
            // Create Spreadsheet object and trigger export
            var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        }
        
    });
});
