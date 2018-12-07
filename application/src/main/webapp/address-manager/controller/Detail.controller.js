"use strict";

/* global location */
sap.ui.define([
    "sap/ui/demo/addressmgr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/demo/addressmgr/model/formatter",
    "sap/ui/demo/addressmgr/model/address",
    "sap/ui/demo/addressmgr/model/MessageType",
    "sap/ui/demo/addressmgr/service/businessPartner",
    "sap/ui/demo/addressmgr/service/socialMediaAccounts",
    "sap/ui/demo/addressmgr/service/translate"
], function (BaseController, JSONModel, Device, formatter, address, MessageType, businessPartnerService, socialMediaAccountsService, translateService) {
    return BaseController.extend("sap.ui.demo.addressmgr.controller.Detail", {
        viewModelName: "detailView",
        mainModelName: "details",
        formatter: formatter,

        onInit: function () {
            this.setViewModel(new JSONModel({
                busy: false
            }));

            this.setMainModel(new JSONModel());
            this.setModel(new JSONModel(), "socialMedia")
            this.getRouter().getRoute("businessPartner").attachPatternMatched(this._onBusinessPartnerMatched, this);

            var that = this;
            var oModel = this.getMainModel();
            oModel.attachRequestCompleted(function () {
                that._loadSocialMediaModel(that._getCurrentBusinessPartnerId()); 
            });
        },

        onAddAddress: function () {
            this.openEditDialog();
        },

        onEditAddress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext(this.mainModelName);
            this.openEditDialog(oContext.getModel().getProperty(oContext.getPath()));
        },
        
        onTranslatePosition: function() {
            const position = this._getCurrentBusinessPartnerPosition();
            translateService.translate(position)
                .done(function(data) {
                    const regexp = /Translation: (.+)/;
                    const splittedResult = regexp.exec(data);
                    if(splittedResult == null || splittedResult.length < 2) {
                        MessageBox.warning("No translation found for '" + position + "'.");
                    } else {
                        MessageBox.success("'" + position + "' can be translated as '" + splittedResult[1] + "'.");
                    }
                })
                .fail(function() {
                    MessageBox.error("Translate request failed.");
                });
        },

        onSubmitEditAddress: function () {
            var that = this;
            var oModel = this.editAddressDialog.getModel("editAddress");
            var oViewModel = this.getViewModel();

            oViewModel.setProperty("/busy", true);
            var action;
            if (oModel.getProperty("/isNew")) {
                action = businessPartnerService.createAddress(oModel.getData());
            } else {
                action = businessPartnerService.updateAddress(oModel.getProperty("/BusinessPartner"), oModel.getProperty("/AddressID"), oModel.getData());
            }

            action.always(function () {
                oViewModel.setProperty("/busy", false);
                that._reloadDetailsModel();
            });

            this.editAddressDialog.close();
        },

        onDeleteAddress: function (oEvent) {
            var that = this;
            var oModel = this.getMainModel();
            var sPath = oEvent.getSource().getBindingContext(this.mainModelName).getPath();
            var oViewModel = this.getViewModel();

            oViewModel.setProperty("/busy", true);

            businessPartnerService.deleteAddress(oModel.getProperty(sPath + "/BusinessPartner"), oModel.getProperty(sPath + "/AddressID"))
                .always(function () {
                    oViewModel.setProperty("/busy", false);
                    that._reloadDetailsModel();
                });
        },

        openEditDialog: function (addressData) {
            if (!this.editAddressDialog) {
                this.editAddressDialog = sap.ui.xmlfragment("sap.ui.demo.addressmgr.view.EditAddress", this);
                this.getView().addDependent(this.editAddressDialog);
                this.editAddressDialog.setModel(new JSONModel({}), "editAddress");
            }

            this.editAddressDialog.getModel("editAddress").setData(address.create(addressData, this.getMainModel().getProperty("/BusinessPartner")));

            this.editAddressDialog.open();
        },

        onDialogClose: function () {
            this.editAddressDialog.close();
        },

        onMarkAddressesChecked: function () {
            var that = this;
            var oViewModel = this.getViewModel();

            oViewModel.setProperty("/busy", true);

            businessPartnerService.markBusinessPartnerAddressesChecked(this._getCurrentBusinessPartnerId())
                .always(function() {
                    oViewModel.setProperty("/busy", false);
                    that._reloadDetailsModel();
                });
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        _onBusinessPartnerMatched: function (oEvent) {
            var sBusinessPartnerId = oEvent.getParameters().arguments.businessPartnerId;
            this._loadDetailsModel(sBusinessPartnerId);
        },

        _loadDetailsModel: function (sBusinessPartnerId) {
            var that = this;
            var oViewModel = this.getViewModel();
            var oModel = this.getMainModel();

            oViewModel.setProperty("/busy", true);

            oModel.attachRequestCompleted(function () {
                oViewModel.setProperty("/busy", false);
            });

            oModel.attachRequestFailed(function () {
                that.getRouter().getTargets().display("detailMessagePage", { messageType: MessageType.NOTHING_FOUND });
            });

            oModel.loadData(businessPartnerService.getBusinessPartnerUrl(sBusinessPartnerId));
        },

        _loadSocialMediaModel: function(sBusinessPartnerId) {
            var that = this;
            var oSocialMediaModel = this.getModel("socialMedia");

            oSocialMediaModel.loadData(socialMediaAccountsService.getSocialMediaAccountsUrl(sBusinessPartnerId));
        },

        _reloadDetailsModel: function () {
            this._loadDetailsModel(this._getCurrentBusinessPartnerId());
        },

        _getCurrentBusinessPartnerId: function () {
            return this.getMainModel().getProperty("/BusinessPartner");
        },
        
     
        _getCurrentBusinessPartnerEmail: function () {
            return this.getMainModel().getProperty("/MiddleName");
        },

        _getCurrentBusinessPartnerPosition: function () {
            return this.getMainModel().getProperty("/SearchTerm1");
        }
        
        
        
        
        
    });
});
